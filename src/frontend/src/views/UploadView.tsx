import AdminUploadForm from '../components/AdminUploadForm';

export default function UploadView() {
  return (
    <section>
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-light tracking-wide text-foreground">Upload Artwork</h2>
        <p className="text-muted-foreground mt-2">Share your art with the gallery community</p>
      </div>
      <AdminUploadForm />
    </section>
  );
}
