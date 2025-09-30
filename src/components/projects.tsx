import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const projects = [
  {
    title: 'ChessProject',
    description: 'Sebuah proyek catur yang dikembangkan menggunakan C++ dengan integrasi engine Stockfish untuk analisis dan permainan.',
    tags: ['C++', 'Stockfish'],
  },
  {
    title: 'Website Pribadi (itsmandapura.com)',
    description: 'Website pribadi yang dibangun dengan tumpukan teknologi modern untuk menampilkan portofolio dan informasi.',
    tags: ['Laravel', 'React', 'TailwindCSS'],
  },
  {
    title: 'Aplikasi Try Out SKD Kedinasan',
    description: 'Aplikasi mobile untuk simulasi ujian SKD sekolah kedinasan, dibangun dengan arsitektur yang skalabel.',
    tags: ['Flutter', 'Go', 'PostgreSQL'],
  },
  {
    title: 'Web Game Dungeon Exploration',
    description: 'Game eksplorasi dungeon berbasis web dengan mekanisme turn-based. Direncanakan untuk menggunakan Phaser.js.',
    tags: ['Laravel', 'React', 'Phaser.js (Plan)'],
  },
];

export default function Projects() {
  return (
    <section id="projects" className="w-full">
      <div className="space-y-4 text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Projek Pribadi
        </h2>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
          Beberapa proyek yang telah saya kerjakan untuk mengasah kemampuan dan
          mengeksplorasi teknologi baru.
        </p>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        {projects.map((project) => (
          <Card
            key={project.title}
            className="flex flex-col justify-between transition-shadow hover:shadow-lg"
          >
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
