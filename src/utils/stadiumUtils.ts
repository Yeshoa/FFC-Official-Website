import { getStadiums } from "@lib/collections";

export async function getStadiumById(id: number) {
  const stadiums = await getStadiums();
  return stadiums.find(stadium => stadium.data.id === id);
}