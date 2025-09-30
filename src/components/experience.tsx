import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const organizations = [
  {
    role: 'Ketua & Pendiri Komunitas Pemrograman',
    organization: 'SMA Negeri 2 Amlapura',
    period: '2024 - 2025',
    description:
      'Menginisiasi dan membentuk komunitas pemrograman pertama di sekolah sebagai wadah belajar coding, berbagi pengetahuan, dan mengembangkan keterampilan teknologi.',
  },
];

export default function Experience() {
  return (
    <section id="experience" className="w-full">
      <div className="space-y-4 text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Organisasi
        </h2>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
          Pengalaman saya dalam berorganisasi dan berkontribusi dalam
          komunitas.
        </p>
      </div>
      <div className="mx-auto mt-8 max-w-3xl">
        {organizations.map((org) => (
          <Card key={org.organization} className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <div className="flex items-start gap-4">
                <div className="grid flex-1 gap-1">
                  <CardTitle>{org.role}</CardTitle>
                  <p className="font-medium">{org.organization}</p>
                  <p className="text-sm text-muted-foreground">{org.period}</p>
                </div>
                <Users className="h-8 w-8 text-accent" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-muted-foreground">{org.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
