import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "#070710" }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "120px 24px 80px" }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: "white", marginBottom: 8 }}>Gizlilik Politikası</h1>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, marginBottom: 48 }}>Son güncelleme: Nisan 2024</p>

        {[
          {
            title: "1. Toplanan Bilgiler",
            content: "ANIFIC olarak, hizmetlerimizi sunmak amacıyla aşağıdaki bilgileri topluyoruz: Ad ve soyad, e-posta adresi, şifre (şifrelenmiş olarak), izleme geçmişi ve tercihler, profil bilgileri ve avatarlar."
          },
          {
            title: "2. Bilgilerin Kullanımı",
            content: "Topladığımız bilgileri şu amaçlarla kullanıyoruz: Hesap oluşturma ve yönetimi, kişiselleştirilmiş içerik önerileri, platform güvenliğinin sağlanması, kullanıcı deneyiminin iyileştirilmesi."
          },
          {
            title: "3. Çerezler",
            content: "Sitemiz, oturum yönetimi ve kullanıcı tercihlerini hatırlamak için çerezler kullanmaktadır. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz, ancak bu durumda bazı özellikler çalışmayabilir."
          },
          {
            title: "4. Üçüncü Taraf Hizmetler",
            content: "Platformumuz, Cloudinary (medya depolama), Neon (veritabanı) ve Pusher (gerçek zamanlı iletişim) gibi üçüncü taraf hizmetleri kullanmaktadır. Bu hizmetlerin kendi gizlilik politikaları mevcuttur."
          },
          {
            title: "5. Veri Güvenliği",
            content: "Kullanıcı verilerinizi korumak için endüstri standardı güvenlik önlemleri kullanıyoruz. Şifreler bcrypt ile şifrelenmekte, veriler güvenli sunucularda saklanmaktadır."
          },
          {
            title: "6. Veri Saklama",
            content: "Hesabınızı sildiğinizde, kişisel verileriniz sistemlerimizden kalıcı olarak silinir. İzleme geçmişi ve yorumlar hesap silme işlemiyle birlikte kaldırılır."
          },
          {
            title: "7. Kullanıcı Hakları",
            content: "Kişisel verilerinize erişme, düzeltme veya silme hakkına sahipsiniz. Bu haklarınızı kullanmak için bizimle iletişime geçebilirsiniz."
          },
          {
            title: "8. İletişim",
            content: "Gizlilik politikamız hakkında sorularınız için anific@iletisim.com adresine e-posta gönderebilirsiniz."
          },
        ].map(section => (
          <div key={section.title} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#a855f7", marginBottom: 12 }}>{section.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.8, fontSize: 15 }}>{section.content}</p>
          </div>
        ))}

        <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <Link href="/" style={{ color: "#a855f7", textDecoration: "none", fontSize: 14 }}>← Ana Sayfaya Dön</Link>
        </div>
      </div>
    </div>
  );
}
