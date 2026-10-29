# International Summer School

Uşaqlar üçün yay məktəbləri kataloqu: valideyn uşağın yaşını, müddəti və ölkəni seçir, uyğun məktəbləri görür və müraciət göndərir. Başqa təşkilatçılar öz məktəblərini pullu tariflə (Baza / Top / Premium) yerləşdirə bilər. Bütün müraciətlər sayt sahibinə gəlir.

## Nə hazırdır

| Bölmə | Səhifə |
| --- | --- |
| Ana səhifə: yaş + müddət + ölkə üzrə axtarış, Premium banner, istiqamətlər | `/` |
| Məktəb səhifəsi: əsas şəkil, yaş, müddət, növbələr, qidalanma, otaq, gəzintilər, transfer, «Qiymətə daxildir / Daxil deyil», qalereya, müraciət forması, WhatsApp | `/schools/<ünvan>` |
| Təşkilatçılar üçün: tariflər və müraciət forması | `/partners` |
| İdarə paneli: məktəb əlavə etmək, redaktə, şəkil yükləmək, müraciətlər | `/admin` |
| Admin girişi | `/login` |

Sayt 3 dildədir: Azərbaycan, İngilis və Rus. Dil yuxarıdakı AZ / EN / RU düymələri ilə seçilir və yadda qalır. Saytın mətnləri `lib/i18n/az.ts`, `en.ts`, `ru.ts` fayllarındadır. Məktəbin mətnlərini Azərbaycan dilində doldurmaq kifayətdir: digər dil boş qalsa, Azərbaycan mətni göstərilir.

Top və Premium məktəblər axtarışda birinci gəlir və «Tövsiyə edirik» nişanı alır. «Saytda son gün» tarixi keçəndə məktəb saytdan avtomatik gizlənir (Bakı vaxtı ilə).

## Quraşdırma

1. [supabase.com](https://supabase.com)-da pulsuz layihə yaradın.
2. Supabase → **SQL Editor**-da `supabase/setup.sql` faylının məzmununu işə salın. Bu, cədvəlləri və şəkillər üçün `school-photos` qovluğunu yaradır.
3. `.env.example` faylını `.env.local` adı ilə köçürün, Supabase → **Project Settings → API**-dakı açarları və telefon nömrənizi yazın.
4. Lokal işə salmaq üçün:
   ```bash
   npm install
   npm run dev
   ```
5. İnternetə çıxarmaq üçün: [vercel.com](https://vercel.com)-da GitHub repo-nu import edin və eyni mühit dəyişənlərini (environment variables) əlavə edin.

### Özünüzü admin etmək

Supabase → **Authentication → Users → Add user** ilə e-poçt və şifrə yaradın, sonra SQL Editor-da:

```sql
insert into admins (user_id) select id from auth.users where email = 'sizin@email.com';
```

Bundan sonra `/login` səhifəsindən daxil olub `/admin`-də məktəbləri özünüz yükləyə bilərsiniz.

## Texniki qeydlər

- Next.js 15 (App Router), Supabase (Postgres, Auth, Storage, row level security).
- Ziyarətçilər yalnız dərc olunmuş məktəbləri görür və müraciət göndərə bilir; müraciətləri və məktəbləri yalnız `admins` cədvəlindəki istifadəçilər görür və dəyişir.
- Şəkillər brauzerdə 1600px-ə qədər kiçildilir və bir-bir yüklənir (Vercel-in 4.5 MB limitinə düşməmək üçün).
- `npm test` qaydaların testlərini, `npm run typecheck` tipləri yoxlayır.
