import { BookOpen, BrainCircuit, Code, Palette } from 'lucide-react';

const hobbies = [
  {
    icon: <BrainCircuit className="h-6 w-6" />,
    name: 'Bermain Catur',
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    name: 'Membaca Buku',
  },
  {
    icon: <Palette className="h-6 w-6" />,
    name: 'Melukis',
  },
  {
    icon: <Code className="h-6 w-6" />,
    name: 'Personal Project Programming',
  },
];

export default function Hobbies() {
  return (
    <section id="hobbies" className="w-full space-y-6">
      <div>
        <h2 className="font-headline text-3xl font-bold tracking-tighter">
          Hobi & Minat
        </h2>
        <p className="mt-2 text-muted-foreground">
          Aktivitas yang saya nikmati di luar kegiatan akademis dan profesional.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {hobbies.map((hobby) => (
          <div
            key={hobby.name}
            className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-transform hover:scale-105"
          >
            <div className="text-accent">{hobby.icon}</div>
            <p className="font-medium">{hobby.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
