import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'A.P.',
    role: 'Student',
    content: 'Pelayanan sangat ramah dan hasil fotonya clean banget! Pasti balik lagi.',
    rating: 5,
  },
  {
    id: 2,
    name: 'R.D.',
    role: 'Content Creator',
    content: 'Booking cepat, studio nyaman, lighting lengkap. Perfect for content creation!',
    rating: 5,
  },
  {
    id: 3,
    name: 'N.W.',
    role: 'Family Session',
    content: 'Photobox-nya fun dan estetik, recommended untuk seru-seruan bareng keluarga!',
    rating: 5,
  },
  {
    id: 4,
    name: 'M.S.',
    role: 'UMKM Owner',
    content: 'Hasil foto produk sangat profesional, meningkatkan penjualan online kami!',
    rating: 5,
  },
  {
    id: 5,
    name: 'D.K.',
    role: 'Corporate Client',
    content: 'Studio Large sangat cocok untuk team photo. Proses booking mudah dan transparan.',
    rating: 5,
  },
  {
    id: 6,
    name: 'S.A.',
    role: 'Pre-wedding',
    content: 'Hasil foto couple kami amazing! Clean, bright, dan sangat cinematic.',
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="section-padding bg-secondary/50">
      <div className="container-wide">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold mt-3 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-muted-foreground text-lg">
            Sudah dipercaya ratusan pelanggan di Denpasar
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="fade-in-section relative p-6 bg-card rounded-2xl border border-border hover:shadow-medium transition-all duration-300"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />

              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
