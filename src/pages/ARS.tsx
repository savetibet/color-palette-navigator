
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Home, Database } from "lucide-react";
import { Link } from "react-router-dom";

const ARS = () => {
  const arsCategories = [
    {
      title: "ARS 700 A to E",
      description: "Series A-E, entries 001-140 each",
      seriesCount: 5,
      entriesPerSeries: 140
    },
    {
      title: "ARS 1200 A to D", 
      description: "Series A-D, entries 001-140 each",
      seriesCount: 4,
      entriesPerSeries: 140
    },
    {
      title: "ARS 1400 A to C",
      description: "Series A-C, entries 001-140 each", 
      seriesCount: 3,
      entriesPerSeries: 140
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Home size={16} />
                Home
              </Button>
            </Link>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Database size={16} />
              <span>ARS Color Management System</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Main Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight">
            ARS
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Advanced Color Reference System - Access standardized color collections organized by series and ranges
          </p>
        </div>

        <Separator className="mb-12" />

        {/* ARS Categories Grid */}
        <div className="grid gap-8 md:gap-12 max-w-4xl mx-auto">
          {arsCategories.map((category, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white">
                  {category.title}
                </CardTitle>
              </CardHeader>
              
              <Separator className="mx-6" />
              
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    {category.description}
                  </p>
                  
                  {/* Data Preview Section - Ready for Integration */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-gray-800 dark:text-white">
                          {category.seriesCount}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Series</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-800 dark:text-white">
                          {category.entriesPerSeries}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Entries/Series</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-800 dark:text-white">
                          {category.seriesCount * category.entriesPerSeries}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Total Colors</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-600 dark:text-blue-400">
                          Available
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Status</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button - Ready for Data Integration */}
                  <div className="text-center pt-4">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg transition-colors duration-200"
                      disabled
                    >
                      Browse Collection
                      <span className="ml-2 text-xs opacity-75">(Coming Soon)</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-16 text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            Ready for data integration with series A-E containing entries 001-140 each
          </p>
        </div>
      </main>
    </div>
  );
};

export default ARS;
