import {trpc} from "../../../utils/trpc";
import {useRouter} from "next/router";

export function useAllPaginated(page: number) {
  return trpc.useQuery([
    'collection.all',
    { page }
  ])
}

export function useCollectionBySlug() {
  const router = useRouter()
  return trpc.useQuery([
    'collection.single',
    { name: router.query.collectionName as string },
  ])
}

export function useCollectionsByProjectId(publicId: string) {
  return trpc.useQuery([
    'collection.project',
    {publicId}
  ])
}