"""SEO routes for SpoedDienst24"""
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/seo", tags=["seo"])

# Service data
SERVICES = [
    {"slug": "loodgieter", "name": "Loodgieter", "icon": "droplet"},
    {"slug": "slotenmaker", "name": "Slotenmaker", "icon": "key"},
    {"slug": "elektricien", "name": "Elektricien", "icon": "zap"}
]

# Problems data with SEO content
PROBLEMS = {
    "lekkage-spoed": {
        "slug": "lekkage-spoed",
        "title": "Spoed Lekkage | 24/7 Loodgieter",
        "service": "loodgieter",
        "h1": "Lekkage? Binnen 30 minuten een loodgieter!",
        "description": "Waterlekkage in huis? Onze spoedloodgieters zijn 24/7 beschikbaar. ✓ Binnen 30 min ter plaatse ✓ Vaste prijzen ✓ Alle soorten lekkages",
        "content": """
            <h2>Lekkage? Wij helpen direct!</h2>
            <p>Een lekkage kan grote schade veroorzaken aan uw woning. Of het nu gaat om een lekkende kraan, gesprongen leiding of daklekkage - onze gecertificeerde loodgieters staan 24/7 voor u klaar.</p>
            <h3>Onze spoed lekkage service:</h3>
            <ul>
                <li>Binnen 30 minuten ter plaatse</li>
                <li>24/7 beschikbaar, ook in het weekend</li>
                <li>Vaste, transparante prijzen</li>
                <li>Alle soorten lekkages</li>
                <li>Verzekerd en gecertificeerd</li>
            </ul>
        """,
        "keywords": ["lekkage spoed", "waterlekkage", "loodgieter spoed", "lekkage verhelpen"]
    },
    "wc-verstopt-spoed": {
        "slug": "wc-verstopt-spoed",
        "title": "WC Verstopt | Spoed Ontstopping 24/7",
        "service": "loodgieter",
        "h1": "WC Verstopt? Direct ontstopt!",
        "description": "Toilet verstopt? Onze ontstoppingsdienst is 24/7 bereikbaar. ✓ Snelle service ✓ Professionele apparatuur ✓ Vaste prijzen",
        "content": """
            <h2>WC verstopt? Wij lossen het op!</h2>
            <p>Een verstopt toilet is niet alleen vervelend, maar ook onhygiënisch. Onze specialisten hebben professionele apparatuur om elke verstopping snel en effectief te verhelpen.</p>
        """,
        "keywords": ["wc verstopt", "toilet verstopt", "ontstopping", "riool verstopt"]
    },
    "riool-verstopt": {
        "slug": "riool-verstopt",
        "title": "Riool Verstopt | 24/7 Rioolservice",
        "service": "loodgieter",
        "h1": "Riool Verstopt? Wij ontstoppen direct!",
        "description": "Riool verstopt of stank uit het riool? Onze rioolspecialisten zijn 24/7 beschikbaar met professionele ontstoppingsapparatuur.",
        "content": """<h2>Professionele rioolontstopping</h2><p>Een verstopt riool kan leiden tot stankoverlast en wateroverlast. Onze rioolspecialisten gebruiken camera-inspectie en hogedrukreiniging voor een effectieve oplossing.</p>""",
        "keywords": ["riool verstopt", "rioolontstopping", "afvoer verstopt", "stankoverlast"]
    },
    "afvoer-verstopt": {
        "slug": "afvoer-verstopt",
        "title": "Afvoer Verstopt | Snelle Ontstopping",
        "service": "loodgieter",
        "h1": "Afvoer Verstopt? Direct hulp!",
        "description": "Afvoer verstopt in keuken of badkamer? Onze loodgieters komen snel langs voor professionele ontstopping.",
        "content": """<h2>Verstopte afvoer verholpen</h2><p>Of het nu de gootsteen, douche of wastafel is - onze loodgieters lossen elke verstopping snel op.</p>""",
        "keywords": ["afvoer verstopt", "gootsteen verstopt", "douche verstopt"]
    },
    "buitengesloten": {
        "slug": "buitengesloten",
        "title": "Buitengesloten | 24/7 Slotenmaker",
        "service": "slotenmaker",
        "h1": "Buitengesloten? Binnen 20 minuten binnen!",
        "description": "Buitengesloten? Onze slotenmakers zijn 24/7 beschikbaar. ✓ Binnen 20 min ter plaatse ✓ Schadevrij openen ✓ Vaste prijzen",
        "content": """
            <h2>Buitengesloten? Wij helpen u snel!</h2>
            <p>Buitengesloten staan is stressvol, zeker 's nachts of bij slecht weer. Onze gecertificeerde slotenmakers openen uw deur snel en meestal schadevrij.</p>
        """,
        "keywords": ["buitengesloten", "deur openen", "slotenmaker spoed", "uitgeslotenheid"]
    },
    "sleutel-afgebroken": {
        "slug": "sleutel-afgebroken",
        "title": "Sleutel Afgebroken | Spoed Slotenmaker",
        "service": "slotenmaker",
        "h1": "Sleutel Afgebroken? Direct geholpen!",
        "description": "Sleutel afgebroken in het slot? Onze slotenmakers verwijderen de sleutelrest en maken indien nodig een nieuwe sleutel.",
        "content": """<h2>Afgebroken sleutel verwijderen</h2><p>Een afgebroken sleutel in het slot is vervelend. Onze specialisten verwijderen de sleutelrest vakkundig zonder schade aan het slot.</p>""",
        "keywords": ["sleutel afgebroken", "sleutel vast", "slot defect"]
    },
    "slot-vervangen": {
        "slug": "slot-vervangen",
        "title": "Slot Vervangen | Nieuwe Sloten Plaatsen",
        "service": "slotenmaker",
        "h1": "Slot Vervangen? Wij regelen het!",
        "description": "Slot vervangen na inbraak of verlies? Onze slotenmakers plaatsen nieuwe, gecertificeerde sloten voor optimale veiligheid.",
        "content": """<h2>Professionele slotvervanging</h2><p>Na een inbraak of bij verhuizing is het verstandig de sloten te vervangen. Wij leveren en plaatsen gecertificeerde sloten.</p>""",
        "keywords": ["slot vervangen", "nieuwe sloten", "cilinder vervangen", "inbraakwerend slot"]
    },
    "inbraakschade": {
        "slug": "inbraakschade",
        "title": "Inbraakschade Herstel | 24/7 Service",
        "service": "slotenmaker",
        "h1": "Inbraakschade? Direct hersteld!",
        "description": "Inbraakschade aan deur of slot? Onze slotenmakers herstellen de schade en beveiligen uw woning direct.",
        "content": """<h2>Inbraakschade snel hersteld</h2><p>Na een inbraak is snelle actie belangrijk. Wij herstellen de schade en adviseren over betere beveiliging.</p>""",
        "keywords": ["inbraakschade", "inbraak herstel", "deur ingetrapt", "slot geforceerd"]
    },
    "stroomstoring": {
        "slug": "stroomstoring",
        "title": "Stroomstoring | 24/7 Elektricien",
        "service": "elektricien",
        "h1": "Stroomstoring? Direct verholpen!",
        "description": "Stroomstoring in huis? Onze elektriciens zijn 24/7 beschikbaar om storingen snel en veilig te verhelpen.",
        "content": """
            <h2>Stroomstoring? Wij lossen het op!</h2>
            <p>Geen stroom in huis is niet alleen onhandig, maar kan ook wijzen op een gevaarlijke situatie. Onze gecertificeerde elektriciens lokaliseren en verhelpen de storing snel.</p>
        """,
        "keywords": ["stroomstoring", "geen stroom", "elektricien spoed", "stroom uitgevallen"]
    },
    "kortsluiting": {
        "slug": "kortsluiting",
        "title": "Kortsluiting | Spoed Elektricien",
        "service": "elektricien",
        "h1": "Kortsluiting? Direct een elektricien!",
        "description": "Kortsluiting in huis? Dit kan gevaarlijk zijn. Onze elektriciens komen direct langs om de oorzaak te vinden en te verhelpen.",
        "content": """<h2>Kortsluiting veilig verholpen</h2><p>Kortsluiting kan brand veroorzaken. Schakel direct de stroom uit en bel onze spoed elektricien.</p>""",
        "keywords": ["kortsluiting", "zekering gesprongen", "groep valt uit"]
    },
    "groepenkast-storing": {
        "slug": "groepenkast-storing",
        "title": "Groepenkast Storing | 24/7 Service",
        "service": "elektricien",
        "h1": "Groepenkast Storing? Wij helpen!",
        "description": "Problemen met de groepenkast? Zekeringen die steeds uitvallen? Onze elektriciens lossen het op.",
        "content": """<h2>Groepenkast problemen opgelost</h2><p>Een defecte groepenkast kan gevaarlijk zijn. Onze elektriciens inspecteren en repareren of vervangen uw groepenkast.</p>""",
        "keywords": ["groepenkast storing", "zekering kapot", "groepenkast vervangen"]
    },
    "aardlekschakelaar": {
        "slug": "aardlekschakelaar",
        "title": "Aardlekschakelaar Slaat Uit | Elektricien",
        "service": "elektricien",
        "h1": "Aardlekschakelaar Slaat Steeds Uit?",
        "description": "Aardlekschakelaar die steeds uitslaat? Dit kan wijzen op een aardlek. Onze elektriciens vinden en verhelpen de oorzaak.",
        "content": """<h2>Aardlek opsporen en verhelpen</h2><p>Een aardlekschakelaar die uitslaat beschermt u tegen elektrocutie. Laat de oorzaak vinden door een professional.</p>""",
        "keywords": ["aardlekschakelaar", "aardlek", "stroom valt uit", "elektra storing"]
    }
}

# Cities data
CITIES = [
    {"slug": "amsterdam", "name": "Amsterdam", "province": "Noord-Holland"},
    {"slug": "rotterdam", "name": "Rotterdam", "province": "Zuid-Holland"},
    {"slug": "den-haag", "name": "Den Haag", "province": "Zuid-Holland"},
    {"slug": "utrecht", "name": "Utrecht", "province": "Utrecht"},
    {"slug": "eindhoven", "name": "Eindhoven", "province": "Noord-Brabant"},
    {"slug": "tilburg", "name": "Tilburg", "province": "Noord-Brabant"},
    {"slug": "groningen", "name": "Groningen", "province": "Groningen"},
    {"slug": "almere", "name": "Almere", "province": "Flevoland"},
    {"slug": "breda", "name": "Breda", "province": "Noord-Brabant"},
    {"slug": "nijmegen", "name": "Nijmegen", "province": "Gelderland"},
    {"slug": "enschede", "name": "Enschede", "province": "Overijssel"},
    {"slug": "haarlem", "name": "Haarlem", "province": "Noord-Holland"},
    {"slug": "arnhem", "name": "Arnhem", "province": "Gelderland"},
    {"slug": "zaanstad", "name": "Zaanstad", "province": "Noord-Holland"},
    {"slug": "amersfoort", "name": "Amersfoort", "province": "Utrecht"},
    {"slug": "apeldoorn", "name": "Apeldoorn", "province": "Gelderland"},
    {"slug": "hoofddorp", "name": "Hoofddorp", "province": "Noord-Holland"},
    {"slug": "maastricht", "name": "Maastricht", "province": "Limburg"},
    {"slug": "leiden", "name": "Leiden", "province": "Zuid-Holland"},
    {"slug": "dordrecht", "name": "Dordrecht", "province": "Zuid-Holland"},
    {"slug": "zoetermeer", "name": "Zoetermeer", "province": "Zuid-Holland"},
    {"slug": "zwolle", "name": "Zwolle", "province": "Overijssel"},
    {"slug": "deventer", "name": "Deventer", "province": "Overijssel"},
    {"slug": "delft", "name": "Delft", "province": "Zuid-Holland"},
    {"slug": "alkmaar", "name": "Alkmaar", "province": "Noord-Holland"},
    {"slug": "heerlen", "name": "Heerlen", "province": "Limburg"},
    {"slug": "venlo", "name": "Venlo", "province": "Limburg"},
    {"slug": "leeuwarden", "name": "Leeuwarden", "province": "Friesland"},
    {"slug": "amsterdam-zuidoost", "name": "Amsterdam Zuidoost", "province": "Noord-Holland"},
    {"slug": "hilversum", "name": "Hilversum", "province": "Noord-Holland"},
    {"slug": "hengelo", "name": "Hengelo", "province": "Overijssel"},
    {"slug": "oss", "name": "Oss", "province": "Noord-Brabant"},
    {"slug": "sittard", "name": "Sittard", "province": "Limburg"},
    {"slug": "roosendaal", "name": "Roosendaal", "province": "Noord-Brabant"},
    {"slug": "purmerend", "name": "Purmerend", "province": "Noord-Holland"},
    {"slug": "schiedam", "name": "Schiedam", "province": "Zuid-Holland"},
    {"slug": "spijkenisse", "name": "Spijkenisse", "province": "Zuid-Holland"},
    {"slug": "helmond", "name": "Helmond", "province": "Noord-Brabant"},
    {"slug": "vlaardingen", "name": "Vlaardingen", "province": "Zuid-Holland"},
    {"slug": "almelo", "name": "Almelo", "province": "Overijssel"}
]


@router.get("/services")
async def get_services():
    """Get all services"""
    return {"services": SERVICES}


@router.get("/problems")
async def get_problems():
    """Get all problem pages"""
    return {"problems": list(PROBLEMS.values())}


@router.get("/problems/{problem_slug}")
async def get_problem(problem_slug: str):
    """Get problem page by slug"""
    problem = PROBLEMS.get(problem_slug)
    if not problem:
        raise HTTPException(status_code=404, detail="Probleem pagina niet gevonden")
    return problem


@router.get("/cities")
async def get_cities():
    """Get all cities"""
    return {"cities": CITIES}


@router.get("/cities/{service_slug}/{city_slug}")
async def get_city_service(service_slug: str, city_slug: str):
    """Get city service page data"""
    # Find service
    service = next((s for s in SERVICES if s["slug"] == service_slug), None)
    if not service:
        raise HTTPException(status_code=404, detail="Service niet gevonden")
    
    # Find city
    city = next((c for c in CITIES if c["slug"] == city_slug), None)
    if not city:
        raise HTTPException(status_code=404, detail="Stad niet gevonden")
    
    # Generate page data
    service_names = {
        "loodgieter": {"name": "Loodgieter", "article": "een"},
        "slotenmaker": {"name": "Slotenmaker", "article": "een"},
        "elektricien": {"name": "Elektricien", "article": "een"}
    }
    
    svc = service_names.get(service_slug, {"name": service_slug.title(), "article": "een"})
    
    return {
        "slug": f"{service_slug}-{city_slug}",
        "service": service,
        "city": city,
        "title": f"Spoed {svc['name']} {city['name']} | 24/7 Beschikbaar",
        "h1": f"Spoed {svc['name']} in {city['name']}",
        "description": f"Zoekt u {svc['article']} spoed {svc['name'].lower()} in {city['name']}? Onze vakmannen zijn 24/7 beschikbaar en binnen 30 minuten ter plaatse. ✓ Vaste prijzen ✓ Gecertificeerd",
        "content": f"""
            <h2>24/7 {svc['name']} in {city['name']}</h2>
            <p>Heeft u snel {svc['article']} {svc['name'].lower()} nodig in {city['name']} of omgeving? 
            SpoedDienst24 staat dag en nacht voor u klaar met gecertificeerde vakmannen.</p>
            <h3>Onze service in {city['name']}:</h3>
            <ul>
                <li>Binnen 30 minuten ter plaatse in {city['name']}</li>
                <li>24/7 beschikbaar, ook in het weekend</li>
                <li>Vaste, transparante tarieven</li>
                <li>Ervaren en gecertificeerde {svc['name'].lower()}s</li>
                <li>Wij werken in heel {city['province']}</li>
            </ul>
        """,
        "keywords": [
            f"spoed {svc['name'].lower()} {city['name'].lower()}",
            f"{svc['name'].lower()} {city['name'].lower()}",
            f"24 uurs {svc['name'].lower()} {city['name'].lower()}",
            f"{svc['name'].lower()} noodgeval {city['name'].lower()}"
        ]
    }
