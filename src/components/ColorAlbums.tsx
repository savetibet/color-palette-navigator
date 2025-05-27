
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { colorApiService, BackendColorData } from '@/services/colorApi';
import { transformBackendColorToFrontend } from '@/utils/colorDataTransform';
import { ColorData } from '@/types/colors';
import ColorCard from './ColorCard';
import { toast } from 'sonner';
import LoadingSpinner from './LoadingSpinner';

const ALBUM_FAMILIES = [
  { name: 'Album 1', family: 'Red' },
  { name: 'Album 2', family: 'Blue' },
  { name: 'Album 3', family: 'Green' }
];

interface ColorAlbumsProps {
  onDeleteColor: (id: string) => void;
  onAddColor: (color: ColorData) => void;
}

const ColorAlbums = ({ onDeleteColor, onAddColor }: ColorAlbumsProps) => {
  const [searchQueries, setSearchQueries] = useState<{ [key: string]: string }>({});
  const [searchResults, setSearchResults] = useState<{ [key: string]: ColorData[] }>({});
  const [albumColors, setAlbumColors] = useState<{ [key: string]: ColorData[] }>({});
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

  // Load album colors on mount
  useEffect(() => {
    ALBUM_FAMILIES.forEach(album => {
      loadAlbumColors(album.family);
    });
  }, []);

  const loadAlbumColors = async (family: string) => {
    setIsLoading(prev => ({ ...prev, [family]: true }));
    try {
      const backendColors = await colorApiService.getColorsByFamily(family);
      const transformedColors = backendColors.map(transformBackendColorToFrontend);
      setAlbumColors(prev => ({ ...prev, [family]: transformedColors }));
    } catch (error) {
      console.error(`Error loading ${family} album:`, error);
      toast.error(`Failed to load ${family} album`);
    } finally {
      setIsLoading(prev => ({ ...prev, [family]: false }));
    }
  };

  const handleSearch = async (albumFamily: string) => {
    const query = searchQueries[albumFamily];
    if (!query?.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setIsLoading(prev => ({ ...prev, [`search_${albumFamily}`]: true }));
    try {
      const backendColors = await colorApiService.searchColors({ 
        name: query,
        limit: 20 
      });
      const transformedColors = backendColors.map(transformBackendColorToFrontend);
      setSearchResults(prev => ({ ...prev, [albumFamily]: transformedColors }));
      
      if (transformedColors.length === 0) {
        toast.info('No colors found matching your search');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(prev => ({ ...prev, [`search_${albumFamily}`]: false }));
    }
  };

  const clearSearch = (albumFamily: string) => {
    setSearchQueries(prev => ({ ...prev, [albumFamily]: '' }));
    setSearchResults(prev => ({ ...prev, [albumFamily]: [] }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Color Albums</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALBUM_FAMILIES.map((album) => (
          <Card key={album.family} className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {album.name}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {albumColors[album.family]?.length || 0} colors
                </span>
              </CardTitle>
              
              {/* Search functionality */}
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name..."
                  value={searchQueries[album.family] || ''}
                  onChange={(e) => setSearchQueries(prev => ({ 
                    ...prev, 
                    [album.family]: e.target.value 
                  }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch(album.family);
                  }}
                />
                <Button 
                  size="icon" 
                  onClick={() => handleSearch(album.family)}
                  disabled={isLoading[`search_${album.family}`]}
                >
                  {isLoading[`search_${album.family}`] ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {searchResults[album.family]?.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => clearSearch(album.family)}
                >
                  Clear Search
                </Button>
              )}
            </CardHeader>
            
            <CardContent>
              {isLoading[album.family] ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {/* Show search results if available, otherwise show album colors */}
                  {(searchResults[album.family]?.length > 0 
                    ? searchResults[album.family] 
                    : albumColors[album.family] || []
                  ).map((color) => (
                    <ColorCard
                      key={color.id}
                      color={color}
                      displayFormat="all"
                      viewMode="list"
                      onDelete={() => onDeleteColor(color.id)}
                    />
                  ))}
                  
                  {(!albumColors[album.family] || albumColors[album.family].length === 0) && 
                   !isLoading[album.family] && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No colors in this album
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ColorAlbums;
