#!/usr/bin/env python3
"""Regenerate spec-builder-standalone.html (one file: css, js and logo inlined)."""
import base64, os
d = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public')
r = lambda n: open(os.path.join(d, n), encoding='utf8').read()
logo = 'data:image/png;base64,' + base64.b64encode(open(os.path.join(d, 'logo.png'), 'rb').read()).decode()
h = r('index.html')
h = h.replace('<link rel="stylesheet" href="spec-builder.css">', '<style>' + r('spec-builder.css') + '</style>')
h = h.replace('<script src="spec-builder.js"></script>', '<script>' + r('spec-builder.js') + '</script>')
h = h.replace('<script src="site-gen.js"></script>', '<script>' + r('site-gen.js') + '</script>')
h = h.replace('src="logo.png"', 'src="' + logo + '"').replace('href="logo.png"', 'href="' + logo + '"')
open(os.path.join(d, 'spec-builder-standalone.html'), 'w', encoding='utf8').write(h)
