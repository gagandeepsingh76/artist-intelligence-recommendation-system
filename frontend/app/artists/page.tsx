'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/ui/Header';
import { ArtistCard } from '@/components/artists/ArtistCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { api, ApiError } from '@/lib/api';
import { ArtistSummary } from '@/lib/types';
import { Camera, Music, Video, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ArtistsPage() {
  const [artists, setArtists] = useState<ArtistSummary[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isColdStart, setIsColdStart] = useState(false);

  const loadArtists = async (category?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getArtists(category);
      setArtists(data);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setIsColdStart(err.isColdStart);
        setError(err.message);
      } else {
        setError(err.message || 'Failed to load artists');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtists(selectedCategory);
  }, [selectedCategory]);

  const categories = [
    { id: 'all', label: 'All Artists (15)', icon: Filter },
    { id: 'photographer', label: 'Photographers (5)', icon: Camera },
    { id: 'musician', label: 'Musicians (5)', icon: Music },
    { id: 'video_editor', label: 'Video Editors (5)', icon: Video },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <Header
        title="Artist Intelligence Explorer"
        subtitle="Dossiers of 15 creative artists with demonstrated capabilities, claims, and media citations."
        badge="15 Artists Scanned"
      />

      <div className="p-8 space-y-6 max-w-7xl">
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition whitespace-nowrap border',
                  isActive
                    ? 'bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20'
                    : 'bg-surface-200/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-surface-200'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {loading && <LoadingState message="Fetching artist intelligence profiles..." isColdStart={isColdStart} />}

        {error && (
          <ErrorState
            title="Artist Data Unavailable"
            message={error}
            onRetry={() => loadArtists(selectedCategory)}
          />
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {artists.map((artist) => (
              <ArtistCard key={artist.artist_id} artist={artist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
