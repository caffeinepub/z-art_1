import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import { useRoute } from '../hooks/useRoute';

export default function AccessDenied() {
  const { navigate } = useRoute();

  return (
    <div className="flex items-center justify-center py-20">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-serif font-light">Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to access this page. Only administrators can upload artworks.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={() => navigate('gallery')}>
            Return to Gallery
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
