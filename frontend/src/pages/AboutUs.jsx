import React from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import aboutMedia from "@/content/aboutMedia";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Heart,
  Rocket,
  Shield,
  Star,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";

const AboutUs = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const hero =
    aboutMedia?.[0]?.src ||
    "https://images.unsplash.com/photo-1580281657527-47e4b86c065f?q=80&w=1600&auto=format&fit=crop";
  const gallery = aboutMedia?.slice(0, 8) || [];

  const milestones = [
    {
      year: "2023",
      title: "Idea born",
      desc: "We set out to simplify access to quality healthcare.",
    },
    {
      year: "2024",
      title: "First launch",
      desc: "Launched appointment booking and health tips to our first users.",
    },
    {
      year: "2025",
      title: "Care network",
      desc: "Onboarded providers across multiple specialties and cities.",
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Patient-first",
      desc: "Every decision we make starts with patient outcomes.",
    },
    {
      icon: Shield,
      title: "Trust & Privacy",
      desc: "Your data is protected with rigorous security standards.",
    },
    {
      icon: Rocket,
      title: "Relentless Improvement",
      desc: "We iterate quickly to deliver delightful, reliable care experiences.",
    },
    {
      icon: Users,
      title: "Collaboration",
      desc: "We build with clinicians, patients, and partners—together.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-light">
      <Header
        isAuthenticated={isAuthenticated}
        userInitial={user?.firstName?.[0]?.toUpperCase?.() || "U"}
        userType={user?.userType || "patient"}
        onLogout={logout}
      />

      {/* Hero */}
      <section className="relative">
        <div className="h-[42vh] md:h-[56vh] w-full overflow-hidden">
          <img
            src='https://res.cloudinary.com/ds20dwlrs/image/upload/v1759839810/happy_qnujts.jpg'
            alt="Our mission"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-white">
            <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg">
              About MASSS
            </h1>
            <p className="mt-4 max-w-2xl text-white/90 text-lg md:text-xl">
              We are a team of developers and clinicians building the simplest
              way to access healthcare—appointments, guidance, and trusted care
              in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-background">
        <div className="w-full mx-auto px-4 sm:px-6  items-center">
          <div className=" w-full flex flex-col items-center align-middle justify-items-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Our Mission
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed px-20">
              Our mission is to revolutionize the way people access and
              experience healthcare by bringing compassion and technology
              together. We believe that everyone deserves quality care, no
              matter who they are or where they live. Through our platform, we
              aim to connect patients with trusted healthcare professionals,
              simplify the process of booking appointments, and make medical
              guidance available at the right time.
              <br /> We are committed to fostering a healthier community by
              empowering individuals to take charge of their well-being with
              confidence and ease. By combining innovation, empathy, and
              expertise, we strive to make healthcare not just accessible — but
              also personal, proactive, and human-centered. Our mission goes
              beyond treatment; it’s about creating a seamless journey of care
              that supports every stage of life, helping people live longer,
              healthier, and happier lives.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/find-care">
                <Button variant="hero">Find Care</Button>
              </Link>
              <Link to="/healthy-living">
                <Button variant="outline">Health Tips</Button>
              </Link>
            </div>
          </div>
          {/* <div className="grid grid-cols-2 gap-4">
            {(gallery.length ? gallery : [1,2,3,4]).map((item, idx) => (
              <div key={idx} className="rounded-xl overflow-hidden shadow-soft aspect-[4/3]">
                <img 
                  src={typeof item === 'object' ? item.src : 'https://images.unsplash.com/photo-1580281657527-47e4b86c065f?q=80&w=800&auto=format&fit=crop'} 
                  alt={typeof item === 'object' ? (item.alt || 'Team') : 'Team'} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div> */}
        </div>
      </section>

      {/* Team */}
<section className="py-16">
  <div className="max-w-6xl mx-auto px-4 sm:px-6">
    <h2 className="text-3xl font-bold text-foreground text-center mb-12">
      Meet the Team
    </h2>

    {(() => {
      const team = (aboutMedia || []).filter(m => m && m.src);
      if (team.length === 5) {
        // 3 on top (equal width), 2 centered below at the same width, without increasing photo size.
        // Use a 6-col grid on md+ to center bottom two (start at columns 2 and 4). On small screens fallback to 2/3 cols.
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {team.map((m, i) => {
              const common = 'col-span-1 sm:col-span-1 md:col-span-2';
              const placement =
                i < 3
                  ? '' // first row auto places into 3 columns (md spans 2 each)
                  : i === 3
                  ? 'md:col-start-2'
                  : 'md:col-start-4';
              return (
                <div key={i} className={`${common} ${placement}`}>
                  <Card className="border-none shadow-soft hover:shadow-medium transition-all group w-full">
                    <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
                      <img src={m.src} alt={m.alt || m.name || 'Team member'} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                      {(m.name || m.role) && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                          <div className="text-sm opacity-90">{m.role || 'Team'}</div>
                          <div className="text-lg font-semibold leading-tight">{m.name || m.alt || 'Member'}</div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        );
      }
      // Fallback responsive grid for other counts
      return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {team.map((m, i, arr) => (
            <div key={i} className="w-full">
              <Card className="border-none shadow-soft hover:shadow-medium transition-all group w-full max-w-sm">
                <div className="relative rounded-t-xl overflow-hidden aspect-[4/3]">
                  <img src={m.src} alt={m.alt || m.name || 'Team member'} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                  {(m.name || m.role) && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                      <div className="text-sm opacity-90">{m.role || 'Team'}</div>
                      <div className="text-lg font-semibold leading-tight">{m.name || m.alt || 'Member'}</div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      );
    })()}
  </div>
</section>


      {/* Values */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <Card
                  key={i}
                  className="border-none shadow-soft hover:shadow-medium transition-all"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center text-white mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="font-semibold text-lg">{v.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {v.desc}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Our Journey
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {milestones.map((m, i) => (
              <Card key={i} className="border-none shadow-soft">
                <CardContent className="p-6 text-center">
                  <div className="text-primary text-3xl font-extrabold">
                    {m.year}
                  </div>
                  <div className="font-semibold mt-2">{m.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {m.desc}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            We are building the future of healthcare access
          </h2>
          <p className="text-muted-foreground mb-6">
            Have feedback or want to partner? We would love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:support@masss.com" className="inline-flex">
              <Button variant="hero">
                <Mail className="h-4 w-4" /> Contact Us
              </Button>
            </a>
            <Link to="/find-care" className="inline-flex">
              <Button variant="outline">
                <MapPin className="h-4 w-4" /> Browse Doctors
              </Button>
            </Link>
          </div>
          <div className="mt-6 text-sm text-muted-foreground flex items-center justify-center gap-4">
            <span className="inline-flex items-center gap-1">
              <Phone className="h-4 w-4" /> +1 (555) 123-4567
            </span>
            <span className="inline-flex items-center gap-1">
              <Mail className="h-4 w-4" /> support@masss.com
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
