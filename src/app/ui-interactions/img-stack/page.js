import CenteredPageLayout from '@/components/core/CenteredPageLayout';
import ImgStack from "./ImgStack"

export const metadata = {
  title: "Image Stack - UiGlow",
  description: "Interactive layered image stacking component with smooth animations and hover effects.",
};

export default function ImgStackPage() {
  const imageUrls = [
    'https://res.cloudinary.com/dctgknnt7/image/upload/v1758731403/1_d8uozd.jpg',
    'https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/5_ionpyy.jpg',
    'https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/4_zeoqje.jpg',
    'https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/2_hme6yu.jpg',
    'https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/3_nfdtim.jpg'
  ];

  return (
    <CenteredPageLayout>
      <ImgStack images={imageUrls} />
    </CenteredPageLayout>
  );
}