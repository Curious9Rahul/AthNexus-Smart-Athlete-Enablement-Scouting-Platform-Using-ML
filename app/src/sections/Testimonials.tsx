import { useState } from 'react';
import { Quote, ChevronLeft, ChevronRight, Star, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      quote: "SportSphere transformed how we manage sports at our college. The AI recommendations are incredibly accurate and the transparency has built trust among students and faculty alike.",
      author: "Dr. Rajesh Kumar",
      role: "Sports Coordinator",
      college: "A.P. Shah Institute of Technology",
      rating: 5,
    },
    {
      quote: "As a faculty guide, I now have complete visibility into athlete performance. The explainable AI helps me make fair selections and justify my decisions to students.",
      author: "Prof. Sneha Patel",
      role: "Faculty Guide - Cricket",
      college: "Mumbai University",
      rating: 5,
    },
    {
      quote: "I got selected for the state team because my profile showcased all my achievements. SportSphere gave me the visibility I needed to be recognized.",
      author: "Rahul Sharma",
      role: "Student Athlete",
      college: "Computer Science Dept",
      rating: 5,
    },
  ];

  const achievements = [
    { number: "50+", label: "Colleges Onboarded" },
    { number: "2,500+", label: "Athlete Profiles" },
    { number: "150+", label: "Events Managed" },
    { number: "10,000+", label: "Selections Made" },
  ];

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="relative py-24 bg-[#0f172a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {achievements.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-[#1e293b] rounded-2xl border border-white/5"
            >
              <div className="text-3xl lg:text-4xl font-bold text-lime-400 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-lime-400/10 to-blue-500/10 rounded-3xl blur-2xl" />

          <div className="relative bg-[#1e293b] rounded-3xl border border-white/10 p-8 md:p-12">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* Quote Icon */}
              <div className="hidden lg:block">
                <div className="w-20 h-20 rounded-2xl bg-lime-400/20 flex items-center justify-center">
                  <Quote className="w-10 h-10 text-lime-400" />
                </div>
              </div>

              {/* Testimonial Content */}
              <div className="flex-1 text-center lg:text-left">
                {/* Rating */}
                <div className="flex items-center justify-center lg:justify-start gap-1 mb-4">
                  {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-xl md:text-2xl text-white leading-relaxed mb-6">
                  "{testimonials[activeIndex].quote}"
                </blockquote>

                {/* Author */}
                <div>
                  <div className="text-white font-semibold">{testimonials[activeIndex].author}</div>
                  <div className="text-lime-400 text-sm">{testimonials[activeIndex].role}</div>
                  <div className="text-gray-500 text-sm">{testimonials[activeIndex].college}</div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex lg:flex-col gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevTestimonial}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextTestimonial}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeIndex
                      ? 'w-8 bg-lime-400'
                      : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Achievement Banner */}
        <div className="mt-12 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-500/30 p-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <span className="text-white font-semibold">Winner: Best Sports Tech Platform 2025</span>
              <span className="text-gray-400 text-sm ml-2">— Indian Education Awards</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
