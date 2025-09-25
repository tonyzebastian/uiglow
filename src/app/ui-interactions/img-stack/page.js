import ImgStack from "./ImgStack"

export default function ImgStackPage() {
  const imageUrls = [
    'https://res.cloudinary.com/dctgknnt7/image/upload/v1758731403/1_d8uozd.jpg',
    'https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/5_ionpyy.jpg',
    'https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/4_zeoqje.jpg',
    'https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/2_hme6yu.jpg',
    'https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/3_nfdtim.jpg'
  ];

  return (
    <main className="w-full p-6 flex">
      <div className="w-full flex-1">
        <div className="h-full flex items-center justify-center">
          <ImgStack images={imageUrls} />
        </div>
      </div>
    </main>
  )
}