import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

export default function Hero() {
  const profilePic = PlaceHolderImages.find((p) => p.id === 'profile-picture');

  return (
    <section
      id="hero"
      className="w-full bg-secondary/50"
    >
      <div className="container mx-auto grid min-h-[70vh] items-center gap-6 px-4 py-12 md:grid-cols-2 md:gap-10 md:px-6 lg:min-h-[80vh]">
        <div className="relative mx-auto h-64 w-64 overflow-hidden rounded-full md:h-80 md:w-80">
          {profilePic && (
            <Image
              src={profilePic.imageUrl}
              alt={profilePic.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={profilePic.imageHint}
            />
          )}
        </div>
        <div className="space-y-4 text-center md:text-left">
          <div className="space-y-2">
            <h1 className="font-headline text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              I Gede Arya Krisnanda Sutasoma
            </h1>
            <p className="text-lg font-medium text-muted-foreground md:text-xl">
              Calon Dokter | Programmer Muda | Problem Solver
            </p>
          </div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
            <Button asChild size="lg">
              <a href="/CV I Gede Arya Krisnanda Sutasoma.pdf" download="CV I Gede Arya Krisnanda Sutasoma.pdf">
                Download CV
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="#contact">Contact Me</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
