import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Calendar, ArrowRight } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "5 tekenen dat je elektra aan vervanging toe is",
    excerpt: "Knipperende lampen, warmte bij stopcontacten... Leer de waarschuwingssignalen herkennen.",
    date: "15 januari 2024",
    category: "Elektricien",
    image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80"
  },
  {
    id: 2,
    title: "Lekkage? Dit kun je zelf doen (en wanneer bel je een vakman)",
    excerpt: "Eerste hulp bij wateroverlast en wanneer je echt professionele hulp nodig hebt.",
    date: "12 januari 2024",
    category: "Loodgieter",
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80"
  },
  {
    id: 3,
    title: "Buitengesloten: wat te doen en hoe te voorkomen",
    excerpt: "Tips voor als je voor een dichte deur staat en hoe je dit in de toekomst voorkomt.",
    date: "8 januari 2024",
    category: "Slotenmaker",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"
  },
  {
    id: 4,
    title: "Winterklaar: bescherm je woning tegen vorst",
    excerpt: "Voorkom bevroren leidingen en andere winterse ellende met deze tips.",
    date: "5 januari 2024",
    category: "Tips",
    image: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=400&q=80"
  },
  {
    id: 5,
    title: "Slim wonen: domotica voor beginners",
    excerpt: "Maak je huis slimmer met deze eenvoudige smart home oplossingen.",
    date: "2 januari 2024",
    category: "Elektricien",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&q=80"
  },
  {
    id: 6,
    title: "VvE onderhoud: een checklist voor beheerders",
    excerpt: "Alles wat je moet weten over het onderhouden van een appartementencomplex.",
    date: "28 december 2023",
    category: "VvE",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80"
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF4500] rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg">SpoedDienst24</span>
          </Link>
          <Link to="/boek/elektricien">
            <Button className="bg-[#FF4500] hover:bg-[#CC3700]">Direct Boeken</Button>
          </Link>
        </div>
      </header>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-heading font-black text-4xl sm:text-5xl text-slate-900 mb-4 text-center">
            Blog & <span className="text-[#FF4500]">Tips</span>
          </h1>
          <p className="text-xl text-slate-600 text-center max-w-2xl mx-auto">
            Handige tips, nieuws en advies over onderhoud van je woning
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-[#FF4500] bg-[#FF4500]/10 px-2 py-1 rounded">{post.category}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </span>
                  </div>
                  <h2 className="font-heading font-bold text-xl text-slate-900 mb-2 line-clamp-2">{post.title}</h2>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <Button variant="ghost" className="p-0 h-auto text-[#FF4500] hover:text-[#CC3700]">
                    Lees meer <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#FF4500]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl text-white mb-4">Hulp nodig bij een klus?</h2>
          <p className="text-white/90 mb-8">Onze vakmannen staan 24/7 voor je klaar</p>
          <Link to="/boek/elektricien">
            <Button className="bg-white text-[#FF4500] hover:bg-slate-100 px-6 py-3 h-auto font-bold">
              Direct een vakman boeken
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 text-center">
        <Link to="/" className="text-white hover:text-[#FF4500]">← Terug naar home</Link>
        <p className="text-slate-500 text-sm mt-4">© 2024 SpoedDienst24.nl</p>
      </footer>
    </div>
  );
}
