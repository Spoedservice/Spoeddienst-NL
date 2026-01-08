import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Zap, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const faqs = [
  {
    category: "Aanmelden",
    questions: [
      {
        q: "Hoe kan ik me aanmelden als vakman?",
        a: "Je kunt je aanmelden via onze website door naar /vakman/register te gaan. Vul je gegevens in, inclusief je KvK-nummer en vakgebied. Na controle van je gegevens ontvang je binnen 48 uur bericht of je bent goedgekeurd."
      },
      {
        q: "Welke documenten heb ik nodig om me aan te melden?",
        a: "Je hebt nodig: een geldig KvK-nummer, een kopie van je identiteitsbewijs, en eventuele certificaten of diploma's die relevant zijn voor je vakgebied (zoals VCA voor elektriciens)."
      },
      {
        q: "Kost het geld om me aan te melden?",
        a: "Aanmelden is gratis. We werken op commissiebasis: alleen wanneer je een klus voltooit en betaald krijgt, betaal je een percentage aan SpoedDienst24."
      }
    ]
  },
  {
    category: "Klussen",
    questions: [
      {
        q: "Hoe ontvang ik klussen?",
        a: "Na goedkeuring ontvang je klussen via de app en het dashboard. Je krijgt notificaties voor nieuwe klussen in jouw regio en vakgebied. Je kunt zelf kiezen welke klussen je accepteert."
      },
      {
        q: "Kan ik klussen weigeren?",
        a: "Ja, je bent volledig vrij om klussen te accepteren of te weigeren. Er zijn geen verplichtingen om een bepaald aantal klussen te doen. Let wel: te vaak afzeggen na acceptatie kan je rating beïnvloeden."
      },
      {
        q: "Wat als een klus groter blijkt dan beschreven?",
        a: "Bespreek dit altijd eerst met de klant voordat je begint. Je kunt meerwerk via de app registreren. De klant moet akkoord gaan met de extra kosten voordat je het meerwerk uitvoert."
      }
    ]
  },
  {
    category: "Betalingen",
    questions: [
      {
        q: "Hoe en wanneer word ik betaald?",
        a: "Betalingen worden wekelijks uitbetaald op je zakelijke rekening. De klant betaalt via het platform, en wij zorgen voor de uitbetaling minus de commissie."
      },
      {
        q: "Hoeveel commissie rekent SpoedDienst24?",
        a: "We hanteren een commissie van 15% per voltooide klus. Dit percentage is inclusief de kosten voor het platform, klantenservice en betalingsafhandeling."
      },
      {
        q: "Wat als een klant niet betaalt?",
        a: "Klanten betalen via ons platform, dus je loopt geen risico op wanbetaling. Wij handelen de betalingen af en jij krijgt altijd uitbetaald voor voltooide klussen."
      }
    ]
  },
  {
    category: "Support",
    questions: [
      {
        q: "Waar kan ik terecht met vragen of problemen?",
        a: "Ons supportteam is bereikbaar via e-mail (vakman@spoeddienst24.nl) en telefoon (0800-1234). We zijn beschikbaar van maandag t/m vrijdag, 8:00 - 18:00 uur."
      },
      {
        q: "Wat als er een klacht is over mijn werk?",
        a: "Bij een klacht nemen wij contact met je op om de situatie te bespreken. We streven naar een eerlijke oplossing voor beide partijen. Bij herhaalde klachten kan dit gevolgen hebben voor je account."
      }
    ]
  }
];

export default function VakmanFAQPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF4500] rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg">SpoedDienst24</span>
          </Link>
          <Link to="/vakman/register">
            <Button className="bg-[#FF4500] hover:bg-[#CC3700]">
              Word Vakman
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading font-bold text-4xl text-slate-900 mb-4">
            Veelgestelde vragen voor vakmannen
          </h1>
          <p className="text-slate-600 mb-8">
            Vind snel antwoord op je vragen over werken via SpoedDienst24
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Zoek in veelgestelde vragen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {filteredFaqs.length === 0 ? (
            <p className="text-center text-slate-500">Geen resultaten gevonden voor "{searchQuery}"</p>
          ) : (
            filteredFaqs.map((category, idx) => (
              <div key={idx} className="mb-10">
                <h2 className="font-heading font-bold text-2xl text-slate-900 mb-4">
                  {category.category}
                </h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.questions.map((faq, faqIdx) => (
                    <AccordionItem 
                      key={faqIdx} 
                      value={`${idx}-${faqIdx}`}
                      className="border border-slate-200 rounded-lg px-4"
                    >
                      <AccordionTrigger className="text-left font-medium text-slate-900 hover:text-[#FF4500]">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))
          )}
        </div>
      </main>

      {/* CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-2xl text-slate-900 mb-4">
            Vraag niet beantwoord?
          </h2>
          <p className="text-slate-600 mb-6">
            Neem contact op met ons supportteam
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:vakman@spoeddienst24.nl">
              <Button variant="outline">vakman@spoeddienst24.nl</Button>
            </a>
            <a href="tel:0800-1234">
              <Button className="bg-[#FF4500] hover:bg-[#CC3700]">Bel 0800-1234</Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 text-center">
        <Link to="/vakman" className="text-white hover:text-[#FF4500]">← Terug naar vakman info</Link>
        <p className="text-slate-500 text-sm mt-4">© 2024 SpoedDienst24.nl</p>
      </footer>
    </div>
  );
}
