'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import React from 'react';

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Nama harus memiliki setidaknya 2 karakter.' }),
  email: z.string().email({ message: 'Mohon masukkan alamat email yang valid.' }),
  message: z
    .string()
    .min(10, { message: 'Pesan harus memiliki setidaknya 10 karakter.' }),
});

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "56649e71-bb1f-4f58-965d-b069203df15d",
          name: values.name,
          email: values.email,
          message: values.message,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Pesan Terkirim!',
          description: 'Terima kasih telah menghubungi saya. Saya akan segera membalasnya.',
        });
        form.reset();
      } else {
        throw new Error("Gagal mengirim");
      }
    } catch (error) {
      toast({
        title: 'Gagal Mengirim Pesan',
        description: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="contact" className="w-full">
      <div className="space-y-4 text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Hubungi Saya
        </h2>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
          Punya pertanyaan atau ingin berkolaborasi? Jangan ragu untuk
          menghubungi saya.
        </p>
      </div>
      <div className="mx-auto mt-8 max-w-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama Lengkap Anda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pesan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tuliskan pesan Anda di sini..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting} variant="secondary">
              {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
}
