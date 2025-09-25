import ImageSpotlight from "./ImageSpotlight"

export default function ImageSpotlightPage() {
  return (
    <main className="w-full p-6">
      <div className="flex justify-center gap-2">
        <ImageSpotlight
          src="https://res.cloudinary.com/dctgknnt7/image/upload/v1758731403/1_d8uozd.jpg"
          alt="Portrait image with spotlight effect"
          orientation="portrait"
          width={300}
          height={400}
        />
        <ImageSpotlight
          src="https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/2_hme6yu.jpg"
          alt="Portrait image with spotlight effect"
          orientation="portrait"
          width={300}
          height={400}
        />
        <ImageSpotlight
          src="https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/3_nfdtim.jpg"
          alt="Portrait image with spotlight effect"
          orientation="portrait"
          width={300}
          height={400}
        />
      </div>
    </main>
  )
}