import Hero from '@/components/hero';
import About from '@/components/about';
import Skills from '@/components/skills';
import Education from '@/components/education';
import Achievements from '@/components/achievements';
import Experience from '@/components/experience';
import Projects from '@/components/projects';
import Languages from '@/components/languages';
import Hobbies from '@/components/hobbies';
import Contact from '@/components/contact';
import { ResumeSummary } from '@/components/resume-summary';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <div className="container mx-auto px-4 py-8 md:px-6 lg:py-16">
        <div className="space-y-12 md:space-y-20">
          <About />
          <Separator />
          <div className="grid gap-12 md:grid-cols-2 md:gap-20">
            <Education />
            <Skills />
          </div>
          <Separator />
          <Achievements />
          <Separator />
          <Experience />
          <Separator />
          <Projects />
          <Separator />
          <div className="grid gap-12 md:grid-cols-2">
            <Languages />
            <Hobbies />
          </div>
          <Separator />
          <ResumeSummary />
          <Separator />
          <Contact />
        </div>
      </div>
    </div>
  );
}
