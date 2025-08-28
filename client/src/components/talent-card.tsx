import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TalentCardProps {
  talent: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
    };
    stageName?: string;
    categories?: string[];
    skills?: string[];
    location?: string;
    rates?: {
      day?: number;
      halfDay?: number;
      hourly?: number;
    };
  };
}

export default function TalentCard({ talent }: TalentCardProps) {
  const displayName = talent.stageName || `${talent.user.firstName} ${talent.user.lastName}`;

  return (
    <Card className="hover:shadow-xl transition-shadow cursor-pointer overflow-hidden" data-testid={`card-talent-${talent.id}`}>
      <Link href={`/talent/${talent.id}`}>
        <div className="relative">
          {talent.user.profileImageUrl ? (
            <img 
              src={talent.user.profileImageUrl} 
              alt={displayName}
              className="w-full h-64 object-cover"
              data-testid={`img-talent-${talent.id}`}
            />
          ) : (
            <div className="w-full h-64 bg-slate-200 flex items-center justify-center">
              <i className="fas fa-user text-slate-400 text-4xl"></i>
            </div>
          )}
        </div>
      </Link>
      
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-1" data-testid={`text-talent-name-${talent.id}`}>
          {displayName}
        </h3>
        
        {talent.categories && talent.categories.length > 0 && (
          <p className="text-sm text-slate-600 mb-2" data-testid={`text-talent-categories-${talent.id}`}>
            {talent.categories.join(", ")}
          </p>
        )}
        
        {talent.location && (
          <p className="text-sm text-slate-500 mb-3" data-testid={`text-talent-location-${talent.id}`}>
            <i className="fas fa-map-marker-alt mr-1"></i>
            {talent.location}
          </p>
        )}
        
        {talent.skills && talent.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {talent.skills.slice(0, 2).map((skill) => (
              <Badge 
                key={skill}
                variant="secondary" 
                className="text-xs"
                data-testid={`badge-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {skill}
              </Badge>
            ))}
            {talent.skills.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{talent.skills.length - 2} more
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-600" data-testid={`text-talent-rate-${talent.id}`}>
            {talent.rates?.day && (
              <span className="font-semibold">${talent.rates.day}/day</span>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/talent/${talent.id}`}>
              <Button variant="ghost" size="sm" data-testid={`button-view-profile-${talent.id}`}>
                View Profile
              </Button>
            </Link>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90 transition-colors"
              data-testid={`button-book-talent-${talent.id}`}
              onClick={() => window.location.href = `/book?talentId=${talent.user.id}&talentName=${encodeURIComponent(displayName)}&stageName=${encodeURIComponent(talent.stageName || '')}`}
            >
              Book
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
