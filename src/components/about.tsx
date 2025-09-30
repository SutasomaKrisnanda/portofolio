import {
  Calendar,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const personalInfo = [
  {
    icon: <Calendar className="h-5 w-5 text-accent" />,
    label: 'Tanggal lahir',
    value: '26 Februari 2007',
  },
  {
    icon: <MapPin className="h-5 w-5 text-accent" />,
    label: 'Asal',
    value: 'Tampaksiring, Gianyar – tinggal di Buleleng, Bali',
  },
  {
    icon: <Mail className="h-5 w-5 text-accent" />,
    label: 'Email',
    value: 'SutasomaKrisnanda@Gmail.com',
    href: 'mailto:SutasomaKrisnanda@Gmail.com',
  },
  {
    icon: <Phone className="h-5 w-5 text-accent" />,
    label: 'No HP',
    value: '089634699449',
    href: 'tel:089634699449',
  },
  {
    icon: <Github className="h-5 w-5 text-accent" />,
    label: 'GitHub',
    value: 'sutasomakrisnanda',
    href: 'https://github.com/sutasomakrisnanda',
  },
  {
    icon: <Linkedin className="h-5 w-5 text-accent" />,
    label: 'LinkedIn',
    value: 'krisnandasutasoma',
    href: 'https://linkedin.com/in/krisnandasutasoma',
  },
];

export default function About() {
  return (
    <section id="about" className="w-full">
      <div className="grid items-start gap-10 md:grid-cols-2 lg:gap-16">
        <div className="space-y-4">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Tentang Saya
          </h2>
          <p className="text-muted-foreground md:text-xl/relaxed">
            Saya adalah individu yang cepat belajar, adaptif, dan mampu
            beradaptasi dengan lingkungan baru. Terbiasa bekerja secara
kolaboratif dalam tim, saya juga memiliki keterampilan pemecahan
masalah yang baik. Selain itu, saya menguasai penggunaan teknologi
dasar serta memiliki pemahaman awal dalam pemrograman. Dengan semangat
tinggi untuk terus berkembang, saya berkomitmen memperluas kemampuan
melalui pendidikan dan pengalaman praktis.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Data Pribadi</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {personalInfo.map((item) => (
                <li key={item.label} className="flex items-start gap-4">
                  {item.icon}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">
                      {item.label}
                    </span>
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium transition-colors hover:text-accent"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="font-medium">{item.value}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
