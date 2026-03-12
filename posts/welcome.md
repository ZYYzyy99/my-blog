# Welcome to Signal Notes

This blog is rendered from Markdown files stored in the local `./posts/` directory.

## How the frontend discovers posts

1. It tries to fetch `./posts/index.json` first.
2. If not found, it attempts to parse links from a directory listing.
3. The post list appears on the homepage.

## Routing

When you click a card, the app updates the URL hash:

```txt
#post=welcome.md
```

The script then fetches the Markdown file and renders it with `marked`.

## Why this setup

- Works as a static frontend.
- Easy to maintain.
- New articles only require adding `.md` files and updating `index.json`.
