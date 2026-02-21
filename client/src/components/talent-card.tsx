import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GcsImage } from "@/components/GcsImage";
import { MapPin, Star } from "lucide-react";

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
    mediaUrls?: string[];
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
    <div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-slate-100"
      data-testid={`card-talent-${talent.id}`}
    >
      {/* Image Section */}
      <Link href={`/talent/${talent.id}`}>
        <div className="relative overflow-hidden">
          {talent.mediaUrls && talent.mediaUrls.length > 0 ? (
            <GcsImage
              objectName={talent.mediaUrls[0]}
              alt={displayName}
              className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
              fallback={
                <div className="w-full h-64 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                  <i className="fas fa-user text-slate-400 text-5xl"></i>
                </div>
              }
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
              <i className="fas fa-user text-slate-400 text-5xl"></i>
            </div>
          )}

          {/* Gradient overlay at the bottom of the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category badge on image */}
          {talent.categories && talent.categories.length > 0 && (
            <div className="absolute top-3 left-3">
              <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                {talent.categories[0]}
              </span>
            </div>
          )}

          {/* Multiple photos indicator */}
          {talent.mediaUrls && talent.mediaUrls.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <i className="fas fa-images text-xs"></i>
              <span>{talent.mediaUrls.length}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-4">
        <div className="mb-3">
          <h3
            className="text-base font-bold text-slate-900 leading-tight mb-0.5 group-hover:text-primary transition-colors"
            data-testid={`text-talent-name-${talent.id}`}
          >
            {displayName}
          </h3>
          {talent.stageName && (
            <p className="text-xs text-slate-500 font-medium">
              {talent.user.firstName} {talent.user.lastName}
            </p>
          )}
        </div>

        {talent.location && (
          <div
            className="flex items-center gap-1.5 text-slate-500 text-xs mb-3"
            data-testid={`text-talent-location-${talent.id}`}
          >
            <MapPin className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
            <span>{talent.location}</span>
          </div>
        )}

        {talent.skills && talent.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4" data-testid={`text-talent-categories-${talent.id}`}>
            {talent.skills.slice(0, 3).map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-xs bg-primary/8 text-primary border-0 hover:bg-primary/15 transition-colors"
                data-testid={`badge-skill-${skill.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {skill}
              </Badge>
            ))}
            {talent.skills.length > 3 && (
              <Badge variant="outline" className="text-xs text-slate-500">
                +{talent.skills.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1 border-t border-slate-100">
          <Link href={`/talent/${talent.id}`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-medium border-slate-200 hover:border-primary hover:text-primary transition-colors"
              data-testid={`button-view-profile-${talent.id}`}
            >
              View Profile
            </Button>
          </Link>
          <Button
            size="sm"
            className="flex-1 text-xs font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white border-0 shadow-sm transition-opacity"
            data-testid={`button-book-talent-${talent.id}`}
            onClick={() =>
              (window.location.href = `/book?talentId=${talent.id}&talentName=${encodeURIComponent(
                displayName
              )}&stageName=${encodeURIComponent(talent.stageName || "")}`)
            }
          >
            <Star className="w-3 h-3 mr-1" />
            Book
          </Button>
        </div>
      </div>
    </div>
  );
}
