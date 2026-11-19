import {NextResponse} from "next/server";
import {supabaseAdmin} from "@/lib/supabaseAdmin";
import {isAdmin} from "@/lib/security";
export const runtime="nodejs";
export async function GET(){
 if(!isAdmin())return NextResponse.json({error:"Нет доступа."},{status:401});
 const [{data:participants,error},{data:status}] = await Promise.all([
  supabaseAdmin.from("participants").select("id,name,wishes,avoid,notes,created_at").order("created_at"),
  supabaseAdmin.from("game_settings").select("registration_open,drawn").eq("id",1).single()
 ]);
 if(error)return NextResponse.json({error:"Не удалось загрузить участников."},{status:500});
 return NextResponse.json({participants,status});
}
