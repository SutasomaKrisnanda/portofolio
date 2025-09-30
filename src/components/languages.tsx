import { Badge } from '@/components/ui/badge';

const languages = [
  'Bahasa Bali',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Bahasa Jepang',
];

export default function Languages() {
  return (
    <section id="languages" className="w-full space-y-6">
      <div>
        <h2 className="font-headline text-3xl font-bold tracking-tighter">
          Bahasa
        </h2>
        <p className="mt-2 text-muted-foreground">
          Bahasa yang saya kuasai untuk berkomunikasi.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {languages.map((lang) => (
          <Badge key={lang} variant="secondary" className="px-4 py-2 text-base">
            {lang}
          </Badge>
        ))}
      </div>
    </section>
  );
}
