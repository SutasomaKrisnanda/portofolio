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
    title: 'Text Case Converter App',
    description: 'Aplikasi utilitas teks berkinerja tinggi yang mendukung standardisasi format kapitalisasi. Dilengkapi algoritma khusus untuk format PUEBI/KBBI (Bahasa Indonesia) dan APA/Chicago style (Bahasa Inggris).',
    tags: ['React', 'TypeScript', 'TailwindCSS', 'Vite'],
  },
  {
    title: 'Website HMJ Kedokteran Undiksha',
    description: 'Sistem informasi dan portal resmi untuk Himpunan Mahasiswa Jurusan Kedokteran Universitas Pendidikan Ganesha. Dirancang dan diinisiasi untuk mempusatkan publikasi, dokumentasi, dan layanan organisasi kedokteran.',
    tags: ['Laravel', 'Filament', 'TailwindCSS'],
  },
  {
    title: 'ChessProject',
    description: 'Sebuah proyek catur yang dikembangkan menggunakan C++ dengan integrasi engine Stockfish untuk analisis dan permainan.',
    tags: ['C++', 'Stockfish'],
  },
  {
    title: 'Aplikasi Try Out SKD Kedinasan',
    description: 'Aplikasi mobile untuk simulasi ujian SKD sekolah kedinasan, dibangun dengan arsitektur yang skalabel.',
    tags: ['Flutter', 'Go', 'PostgreSQL'],
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
