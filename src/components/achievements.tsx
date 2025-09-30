import { Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const achievements = [
  {
    year: '2024',
    title: 'Peringkat 1 OSN Informatika/Komputer',
    level: 'Kabupaten/Kota',
  },
  {
    year: '2023',
    title: 'Juara 1 Story Telling Bahasa Jepang',
  },
  {
    year: '2023',
    title: 'Peringkat 3 OSN Matematika',
    level: 'Kabupaten/Kota',
  },
];

export default function Achievements() {
  return (
    <section id="achievements" className="w-full">
      <div className="space-y-4 text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Prestasi
        </h2>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
          Beberapa pencapaian yang pernah saya raih selama perjalanan belajar
          saya.
        </p>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((item) => (
          <Card key={item.title} className="flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4">
              <Trophy className="h-10 w-10 text-accent" />
              <div>
                <CardTitle>{item.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{item.year}</p>
              {item.level && (
                <p className="text-sm text-muted-foreground">{item.level}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
