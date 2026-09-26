import { getAppContext } from "@/http/utils/getAppContext";
import { ResourceNotFoundError } from "@/use-cases/errors/resource-not-found-error";
import { makeGetCommunityUseCase } from "@/use-cases/factories/communities/make-get-community-by-slug-use-case.";

export const getCommunityBySlug: ControllerFn = async (c) => {
    const { t, params } = getAppContext(c);

    const { slug } = params;

    try {
        const getUseCase = makeGetCommunityUseCase(c);

        const { community } = await getUseCase.execute(slug);

        return c.json({
            community: {
                ...community,
                coverUrl: community.coverId ? `${c.env.S3_API_URL}/${community.coverId}` : undefined,
                patronPhotoUrl: community.patronPhotoId ? `${c.env.S3_API_URL}/${community.patronPhotoId}` : undefined,
                photos: (community.photos || []).map((photo) => ({
                    ...photo,
                    photoUrl: photo.photoId ? `${c.env.S3_API_URL}/${photo.photoId}` : undefined,
                })),
            }
        });
    } catch (err) {
        if (err instanceof ResourceNotFoundError) {
            return c.json({ message: t('error-community-not-found') }, 404);
        }

        throw err;
    }
}