# About DevTalk

DevTalk is a simple way for developers to talk to other developers — randomly.

Think **Omegle**, but instead of random strangers, you get random devs. No profiles, no followers, no communities to manage. You open the app, click start, and you’re connected to another developer in a 1-on-1 video chat.

---

## Why This Exists

Most developer platforms are slow and indirect. You post a question, wait for replies, or scroll through threads hoping someone answers.

Sometimes you don’t want that.

You just want to say:

> “Hey, can you look at this for a second?”

DevTalk is built to recreate that moment , like turning to the person next to you in an office or hopping on a quick call with a teammate. No scheduling, no context switching.

---

## How It Works

* You enter a name (or anything)
* Click start
* Get matched instantly with another developer
* Talk, debug, or just chat
* Skip anytime and get someone new

That’s it.

---

## What You Can Use It For

* Debugging bugs together
* Talking through system design ideas
* Pair programming short problems
* Casual dev conversations
* Co-working silently on a call

There’s no expectation. If it’s not useful, you skip and move on.

---

## Features

* **Instant matching** — one click, no accounts required
* **1:1 video + audio** — direct peer-to-peer connection
* **Text chat** — share snippets, errors, or links
* **Fully anonymous** — no profiles, no history

---

## Tech Stack (Simple + Direct)

* **Frontend:** React, TypeScript, Tailwind CSS
* **UI Animation:** Framer Motion
* **Signaling:** Node.js + Socket.io
* **Media:** WebRTC (pure peer-to-peer)

Video and audio streams go directly between users. No media is stored or relayed through servers.

---

## Current State

DevTalk is live and working.

Core issues like WebRTC signaling order, race conditions, and reconnections have been handled to keep calls stable across different networks.

This is an ongoing project, and the goal is simple:

> Make it easy for developers to talk to other developers — instantly.
