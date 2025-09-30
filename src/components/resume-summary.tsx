'use client';
import { useState } from 'react';
import { generateResumeSummary } from '@/ai/flows/resume-summary-generator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react';

const exampleResume = `I Gede Arya Krisnanda Sutasoma
Calon Dokter | Programmer Muda | Problem Solver

TENTANG SAYA
Saya adalah individu yang cepat belajar, adaptif, dan mampu beradaptasi dengan lingkungan baru. Terbiasa bekerja secara kolaboratif dalam tim, saya juga memiliki keterampilan pemecahan masalah yang baik. Selain itu, saya menguasai penggunaan teknologi dasar serta memiliki pemahaman awal dalam pemrograman. Dengan semangat tinggi untuk terus berkembang, saya berkomitmen memperluas kemampuan melalui pendidikan dan pengalaman praktis.

PENDIDIKAN
- Universitas Pendidikan Kedokteran (2025 - sekarang)
- SMA Negeri 2 Amlapura (2022 - 2025)
- SMP Negeri 5 Amlapura (2019 - 2022)

KEAHLIAN
Manajemen Waktu, Kerja Tim, Problem Solving, Kreativitas, Teknologi Dasar, Pemrograman Dasar, Analisis Data

PRESTASI
- Juara 1 Story Telling Bahasa Jepang (2023)
- Peringkat 1 Olimpiade Sains Nasional Informatika/Komputer Kabupaten/Kota (2024)
- Peringkat 3 Olimpiade Sains Nasional Matematika Kabupaten/Kota (2023)
`;

export function ResumeSummary() {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setSummary('');
    setError('');

    const formData = new FormData(event.currentTarget);
    const resumeText = formData.get('resumeText') as string;
    const jobDescription = formData.get('jobDescription') as string;

    if (!resumeText.trim()) {
      setError('Resume text cannot be empty.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await generateResumeSummary({ resumeText, jobDescription });
      setSummary(result.summary);
    } catch (e) {
      console.error(e);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="resume-summary" className="w-full">
      <div className="space-y-4 text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          AI Resume Summarizer
        </h2>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
          Gunakan AI untuk meringkas CV Anda secara otomatis atau
          menyesuaikannya dengan deskripsi pekerjaan tertentu.
        </p>
      </div>
      <div className="mx-auto mt-8 grid max-w-6xl gap-8 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            name="resumeText"
            placeholder="Paste your resume text here..."
            className="min-h-[250px]"
            defaultValue={exampleResume}
          />
          <Textarea
            name="jobDescription"
            placeholder="(Optional) Paste job description here to tailor the summary..."
            className="min-h-[150px]"
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Generating...' : 'Generate Summary'}
          </Button>
        </form>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Generated Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {isLoading && (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {error && <p className="text-destructive">{error}</p>}
            {!isLoading && !summary && !error && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                 <Wand2 className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  Your AI-generated summary will appear here.
                </p>
              </div>
            )}
            {summary && (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p>{summary}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
