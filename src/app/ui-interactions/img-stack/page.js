import CenteredPageLayout from '@/components/core/CenteredPageLayout';
import ImgStack from "./ImgStack"

export const metadata = {
  title: "Image Stack - UiGlow",
  description: "Interactive layered image stacking component with smooth animations and hover effects.",
};

export default function ImgStackPage() {
  const imageUrls = [
    'https://images.unsplash.com/photo-1742201877377-03d18a323c18?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1064',
    'https://images.unsplash.com/photo-1757081791153-3f48cd8c67ac?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=987',
    'https://images.unsplash.com/photo-1757626961383-be254afee9a0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=987',
    'https://images.unsplash.com/photo-1756748371390-099e4e6683ae?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=987',
    'https://images.unsplash.com/photo-1755884405235-5c0213aa3374?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=987'
  ];

  return (
    <CenteredPageLayout>
      <ImgStack images={imageUrls} />
    </CenteredPageLayout>
  );
}