import { Progress } from '@/components/ui/progress';

const skills = [
  { name: 'Manajemen Waktu', level: 90 },
  { name: 'Kerja Tim', level: 95 },
  { name: 'Problem Solving', level: 85 },
  { name: 'Kreativitas', level: 80 },
  { name: 'Teknologi Dasar', level: 95 },
  { name: 'Pemrograman Dasar', level: 75 },
  { name: 'Analisis Data', level: 70 },
];

export default function Skills() {
  return (
    <section id="skills" className="w-full space-y-6">
      <div>
        <h2 className="font-headline text-3xl font-bold tracking-tighter">
          Keahlian
        </h2>
        <p className="mt-2 text-muted-foreground">
          Keterampilan yang saya miliki dan terus saya kembangkan.
        </p>
      </div>
      <div className="space-y-4">
        {skills.map((skill) => (
          <div key={skill.name} className="space-y-2">
            <div className="flex justify-between">
              <p className="font-medium">{skill.name}</p>
              <p className="text-sm text-muted-foreground">{skill.level}%</p>
            </div>
            <Progress value={skill.level} aria-label={`${skill.name} proficiency ${skill.level} percent`}/>
          </div>
        ))}
      </div>
    </section>
  );
}
