import { Users, } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const organizations = [
  {
    role: 'Ketua & Pendiri Komunitas Pemrograman',
    organization: 'SMA Negeri 2 Amlapura',
    period: '2024 - 2025',
    icon: <Users className="h-8 w-8 text-accent" />,
    description:
      'Menginisiasi dan membentuk komunitas pemrograman pertama di sekolah sebagai wadah belajar coding, berbagi pengetahuan, dan mengembangkan keterampilan teknologi.',
  },
  {
    role: 'Anggota Aktif UKM Catur',
    organization: 'Universitas Pendidikan Ganesha',
    period: '2025 - Sekarang',
    icon: <Users className="h-8 w-8 text-accent" />,
    description:
      'terlibat langsung dalam dinamika organisasi dengan berkontribusi pada kepanitiaan acara besar seperti Ganesha Grand Chess Tournament (GGCT) dan kejuaraan internal.',
  },
  {
    role: 'Sekretaris Bidang Komnasinfo',
    organization: 'HMJ Kedokteran Universitas Pendidikan Ganesha',
    period: '2026 - Sekarang',
    icon: <Users className="h-8 w-8 text-accent" />,
    description: 'Menginisiasi dan menyusun Website HMJ Undiksha serta mengkoordinasi bidang Komunikasi, Humas, dan Informasi selaku Sekretaris Bidang.'
  },
  {
    role: 'Sekretaris Divisi Intechprochanter',
    organization: 'BSO Hermestha FK Undiksha',
    period: 'Feb 2026 - Sekarang',
    icon: <Users className="h-8 w-8 text-accent" />,
    description: 'Bertanggung jawab atas fungsi Technocrates (pelatihan teknologi) dan HM-SSO (manajemen & pemeliharaan website) di Divisi Intechprochanter.'
  }
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
      <div className="mx-auto mt-8 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 max-w-6xl">
        {organizations.map((org) => (
          <Card key={org.organization} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-accent/20 hover:border-l-accent">
            <CardHeader className="bg-gradient-to-r from-muted/30 to-muted/10 pb-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg leading-tight">{org.role}</CardTitle>
                    <p className="font-medium text-accent">{org.organization}</p>
                    <p className="text-sm text-muted-foreground font-medium">{org.period}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {org.icon}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <p className="text-muted-foreground leading-relaxed">{org.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
