import { GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const educationHistory = [
  {
    institution: 'Universitas Pendidikan Kedokteran',
    period: '2025 - sekarang',
  },
  {
    institution: 'SMA Negeri 2 Amlapura',
    period: '2022 - 2025',
  },
  {
    institution: 'SMP Negeri 5 Amlapura',
    period: '2019 - 2022',
  },
];

export default function Education() {
  return (
    <section id="education" className="w-full space-y-6">
      <div>
        <h2 className="font-headline text-3xl font-bold tracking-tighter">
          Pendidikan
        </h2>
        <p className="mt-2 text-muted-foreground">
          Jejak pendidikan formal yang telah saya tempuh.
        </p>
      </div>
      <div className="space-y-4">
        {educationHistory.map((edu) => (
          <Card key={edu.institution} className="bg-secondary/50">
            <CardHeader className="flex-row items-center gap-4 p-4">
              <div className="rounded-full bg-background p-2">
                <GraduationCap className="h-6 w-6 text-accent" />
              </div>
              <div>
                <CardTitle className="text-base">{edu.institution}</CardTitle>
                <p className="text-sm text-muted-foreground">{edu.period}</p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
