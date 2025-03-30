import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Github, Linkedin, Mail } from "lucide-react";

const teamMembers = [
  {
    name: "Satish Tyagi",
    role: "CEO & Founder",
    image: "",
    bio: "15+ years of experience in fintech and investment banking",
    social: {
      linkedin: "#",
      github: "#",
      email: "sarah@example.com"
    }
  },
  {
    name: "Raushan Kumar",
    role: "Developer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    bio: "Former tech lead at major financial institutions",
    social: {
      linkedin: "#",
      github: "#",
      email: "michael@example.com"
    }
  },

];

const Team = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Our Team</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <div key={member.name} className="bg-card rounded-lg p-6 shadow-lg">
              <img
                src={member.image}
                alt={member.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h2 className="text-xl font-semibold text-center mb-1">{member.name}</h2>
              <p className="text-primary text-center mb-2">{member.role}</p>
              <p className="text-muted-foreground text-center mb-4">{member.bio}</p>
              
              <div className="flex justify-center space-x-4">
                <a href={member.social.linkedin} className="text-muted-foreground hover:text-primary">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href={member.social.github} className="text-muted-foreground hover:text-primary">
                  <Github className="h-5 w-5" />
                </a>
                <a href={`mailto:${member.social.email}`} className="text-muted-foreground hover:text-primary">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Team;