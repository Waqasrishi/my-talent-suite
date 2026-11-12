# AJMN Talent Suite

A clickable sandbox prototype of the Talent Suite and its Strategy Room, beside a replica of the current SuccessFactors setup, for showing management how goals, reviews and strategy decisions would work. Synthetic data only.

It is three static pages (index.html, strategy.html and successfactors.html): no database, no installation.

## Deploy on the AJMN sandbox server

Put index.html in any web folder the server already serves.

**IIS (Windows)**
1. Copy this folder to e.g. C:\inetpub\wwwroot\talent-suite
2. IIS Manager > Sites > Default Web Site > right-click > Add Application
   Alias: talent-suite · Physical path: the folder above
3. Open http://<server>/talent-suite/

**nginx (Linux)**
1. sudo mkdir -p /var/www/talent-suite && sudo cp index.html /var/www/talent-suite/
2. Add to the server block:
       location /talent-suite/ { alias /var/www/talent-suite/; index index.html; }
3. sudo nginx -t && sudo systemctl reload nginx
4. Open http://<server>/talent-suite/

**Apache**
1. sudo mkdir -p /var/www/html/talent-suite && sudo cp index.html /var/www/html/talent-suite/
2. Open http://<server>/talent-suite/

**Quick test without a web server**
Double-click index.html, or run `python3 -m http.server 8080` in this folder and open http://localhost:8080

## Notes
- Each browser keeps its own copy of the data (localStorage). "Reset sandbox" restores the seed data.
- Fonts load from fonts.googleapis.com. If the server has no internet access the page falls back to Segoe UI; nothing else is external.
- Synthetic data only. Do not enter real employee data (rule until Gate B).
- The real build follows build-guide.md (Prompts 0 to 4) and is a separate code project.
