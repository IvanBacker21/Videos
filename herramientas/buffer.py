#!/usr/bin/env python3
"""Programa un short en Buffer (YouTube Shorts y TikTok) por su API GraphQL.

La clave NO va en el repositorio: se lee de la variable BUFFER_KEY o del archivo ~/.buffer_key.

Uso:
  python3 buffer.py canales
  python3 buffer.py programar --red youtube|tiktok --url RAW_MP4 --hora 2026-11-06T21:30 \
      --texto "descripción o caption" [--titulo "Título"] [--borrador]
  python3 buffer.py lista            # publicaciones programadas
  python3 buffer.py borrar POST_ID
--hora es hora de Ciudad de México (UTC-6, sin horario de verano).
"""
import argparse, json, os, sys, urllib.request
from datetime import datetime, timedelta, timezone

API = "https://api.buffer.com"
ORG = "6aee28be6c3957c58fca50e6"
CANALES = {"youtube": "6aee28f7e29c69a17186fa73", "tiktok": "6aee2938e29c69a17186fd79"}
CDMX = timezone(timedelta(hours=-6))


def clave():
    k = os.environ.get("BUFFER_KEY")
    if not k:
        p = os.path.expanduser("~/.buffer_key")
        if os.path.exists(p):
            k = open(p).read().strip()
    if not k:
        sys.exit("Falta la clave: exporta BUFFER_KEY o guarda ~/.buffer_key (nunca en el repo)")
    return k


def gql(query, variables=None):
    req = urllib.request.Request(API, data=json.dumps({"query": query, "variables": variables or {}}).encode(),
                                 headers={"Authorization": "Bearer " + clave(), "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        d = json.load(r)
    if d.get("errors"):
        sys.exit("Error de Buffer: " + json.dumps(d["errors"], ensure_ascii=False))
    return d["data"]


RES = """__typename
  ... on PostActionSuccess { post { id status dueAt channelId } }
  ... on MutationError { message }"""


def programar(a):
    due = datetime.fromisoformat(a.hora).replace(tzinfo=CDMX).astimezone(timezone.utc)
    meta = {}
    if a.red == "youtube":
        meta = {"youtube": {"title": a.titulo, "privacy": "public", "madeForKids": False, "categoryId": "27",
                            "isAiGenerated": False, "notifySubscribers": True, "embeddable": True}}
    else:
        meta = {"tiktok": {"title": a.titulo, "isAiGenerated": True}}
    inp = {"channelId": CANALES[a.red], "text": a.texto, "mode": "customScheduled", "schedulingType": "automatic",
           "dueAt": due.strftime("%Y-%m-%dT%H:%M:%S.000Z"), "needsApproval": False, "saveToDraft": bool(a.borrador),
           "assets": [{"video": {"url": a.url}}], "metadata": meta}
    d = gql("mutation($i: CreatePostInput!){ createPost(input:$i){ %s } }" % RES, {"i": inp})["createPost"]
    print(json.dumps(d, ensure_ascii=False))
    if d.get("__typename") != "PostActionSuccess":
        sys.exit(1)


def main():
    ap = argparse.ArgumentParser()
    sp = ap.add_subparsers(dest="cmd", required=True)
    sp.add_parser("canales")
    sp.add_parser("lista")
    b = sp.add_parser("borrar"); b.add_argument("id")
    p = sp.add_parser("programar")
    p.add_argument("--red", choices=CANALES, required=True); p.add_argument("--url", required=True)
    p.add_argument("--hora", required=True); p.add_argument("--texto", required=True)
    p.add_argument("--titulo", default=""); p.add_argument("--borrador", action="store_true")
    a = ap.parse_args()
    if a.cmd == "canales":
        print(json.dumps(gql('{ channels(input:{organizationId:"%s"}){ id name service isDisconnected } }' % ORG), ensure_ascii=False, indent=1))
    elif a.cmd == "lista":
        d = gql('{ posts(input:{organizationId:"%s", filter:{status:[scheduled, draft]}}, first:20){ edges{ node{ id status dueAt channelId text } } } }' % ORG)
        print(json.dumps(d, ensure_ascii=False, indent=1))
    elif a.cmd == "borrar":
        print(json.dumps(gql('mutation{ deletePost(input:{id:"%s"}){ __typename } }' % a.id), ensure_ascii=False))
    else:
        programar(a)


if __name__ == "__main__":
    main()
