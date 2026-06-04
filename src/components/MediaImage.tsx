import Image, { type ImageProps } from "next/image";

/**
 * next/image wrapper for Payload media: pass the media `url` + the generated
 * `blurDataURL` and it renders placeholder="blur" for the instant preview.
 * (BlurImage/BLUR_DATA stays the wrapper for the STATIC /img assets; this one
 * is for Payload-managed uploads, whose blur lives on the media doc.)
 */
type MediaImageProps = Omit<ImageProps, "src" | "blurDataURL" | "placeholder"> & {
  url: string;
  blurDataURL?: string | null;
};

export function MediaImage({ url, blurDataURL, alt, ...props }: MediaImageProps) {
  if (blurDataURL) {
    return (
      <Image
        src={url}
        alt={alt}
        placeholder="blur"
        blurDataURL={blurDataURL}
        {...props}
      />
    );
  }
  return <Image src={url} alt={alt} {...props} />;
}
