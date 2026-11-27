import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useHotelData() {
  const rooms = useQuery({
    queryKey: ["hotel", "rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotel_rooms")
        .select("id, number, floor, status, price_override, notes, room_type_id, hotel_room_types(name, base_price, capacity)")
        .order("number");
      if (error) throw error;
      return data ?? [];
    },
  });
  const reservations = useQuery({
    queryKey: ["hotel", "reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotel_reservations")
        .select("*, hotel_rooms(number)")
        .order("check_in", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data ?? [];
    },
  });
  return { rooms, reservations };
}

