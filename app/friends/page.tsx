"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getPusherClient } from "@/lib/pusher";

interface Friend { id: string; friend: { id: string; name: string } }
interface FriendRequest { id: string; sender: { id: string; name: string } }
interface Message { id: string; text: string; senderId: string; sender: { name: string }; createdAt: string }

export default function FriendsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [activeFriend, setActiveFriend] = useState<{ id: string; name: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [addName, setAddName] = useState("");
  const [addStatus, setAddStatus] = useState("");
  const [tab, setTab] = useState<"friends" | "requests">("friends");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/friends").then(r => r.json()).then(setFriends);
      fetch("/api/friends/requests").then(r => r.json()).then(setRequests);

      const pusher = getPusherClient();
      const channel = pusher.subscribe(`user-${session!.user.id}`);
      channel.bind("friend-request", (data: FriendRequest) => {
        setRequests(prev => [data, ...prev]);
      });
      channel.bind("friend-accepted", (data: { friend: { id: string; name: string } }) => {
        setFriends(prev => [...prev, { id: Date.now().toString(), friend: data.friend }]);
      });
      return () => pusher.disconnect();
    }
  }, [status]);

  useEffect(() => {
    if (!activeFriend) return;
    fetch(`/api/messages?friendId=${activeFriend.id}`).then(r => r.json()).then(setMessages);

    const pusher = getPusherClient();
    const channelId = [session!.user.id, activeFriend.id].sort().join("-");
    const channel = pusher.subscribe(`dm-${channelId}`);
    channel.bind("new-message", (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => pusher.disconnect();
  }, [activeFriend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendFriendRequest(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: addName }),
    });
    const data = await res.json();
    setAddStatus(res.ok ? "✅ İstek gönderildi!" : `❌ ${data.error}`);
    if (res.ok) setAddName("");
    setTimeout(() => setAddStatus(""), 3000);
  }

  async function respondRequest(id: string, action: "accept" | "reject") {
    await fetch("/api/friends/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const req = requests.find(r => r.id === id);
    setRequests(prev => prev.filter(r => r.id !== id));
    if (action === "accept" && req) {
      setFriends(prev => [...prev, { id: id, friend: req.sender }]);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMsg.trim() || !activeFriend) return;
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: activeFriend.id, text: newMsg }),
    });
    setNewMsg("");
  }

  if (status === "loading") return <div className="min-h-screen gradient-bg flex items-center justify-center"><div className="text-purple-400">Yükleniyor...</div></div>;

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-300 mb-8">Arkadaşlar</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sol panel */}
          <div className="space-y-4">
            {/* Arkadaş ekle */}
            <form onSubmit={sendFriendRequest} className="bg-[#1a1a2e] border border-purple-900/30 rounded-2xl p-4">
              <h2 className="font-bold text-white mb-3 text-sm">Arkadaş Ekle</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={addName}
                  onChange={e => setAddName(e.target.value)}
                  placeholder="Kullanıcı adı"
                  className="flex-1 bg-[#0a0a0f] border border-purple-900/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  required
                />
                <button type="submit" className="bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded-lg text-sm transition-colors">+</button>
              </div>
              {addStatus && <p className="text-xs mt-2">{addStatus}</p>}
            </form>

            {/* Tabs */}
            <div className="bg-[#1a1a2e] border border-purple-900/30 rounded-2xl overflow-hidden">
              <div className="flex border-b border-purple-900/30">
                <button onClick={() => setTab("friends")} className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === "friends" ? "text-purple-400 bg-purple-900/20" : "text-gray-500 hover:text-gray-300"}`}>
                  Arkadaşlar ({friends.length})
                </button>
                <button onClick={() => setTab("requests")} className={`flex-1 py-3 text-sm font-medium transition-colors relative ${tab === "requests" ? "text-purple-400 bg-purple-900/20" : "text-gray-500 hover:text-gray-300"}`}>
                  İstekler {requests.length > 0 && <span className="absolute top-2 right-4 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">{requests.length}</span>}
                </button>
              </div>

              <div className="divide-y divide-purple-900/10 max-h-80 overflow-y-auto">
                {tab === "friends" && (
                  friends.length === 0 ? (
                    <p className="text-center text-gray-600 text-sm py-6">Henüz arkadaşın yok</p>
                  ) : friends.map(f => (
                    <button key={f.id} onClick={() => setActiveFriend(f.friend)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-purple-900/20 transition-colors ${activeFriend?.id === f.friend.id ? "bg-purple-900/20" : ""}`}>
                      <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-sm font-bold">{f.friend.name[0]}</div>
                      <span className="text-sm text-white">{f.friend.name}</span>
                    </button>
                  ))
                )}
                {tab === "requests" && (
                  requests.length === 0 ? (
                    <p className="text-center text-gray-600 text-sm py-6">Bekleyen istek yok</p>
                  ) : requests.map(r => (
                    <div key={r.id} className="px-4 py-3">
                      <p className="text-sm text-white mb-2">{r.sender.name}</p>
                      <div className="flex gap-2">
                        <button onClick={() => respondRequest(r.id, "accept")} className="flex-1 bg-purple-600 hover:bg-purple-500 py-1.5 rounded-lg text-xs font-medium transition-colors">Kabul</button>
                        <button onClick={() => respondRequest(r.id, "reject")} className="flex-1 bg-gray-800 hover:bg-gray-700 py-1.5 rounded-lg text-xs font-medium transition-colors text-gray-400">Reddet</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sağ panel - DM */}
          <div className="md:col-span-2">
            {activeFriend ? (
              <div className="bg-[#1a1a2e] border border-purple-900/30 rounded-2xl flex flex-col h-[500px]">
                <div className="px-4 py-3 border-b border-purple-900/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-sm font-bold">{activeFriend.name[0]}</div>
                  <span className="font-medium text-white">{activeFriend.name}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === session?.user.id ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs px-3 py-2 rounded-xl text-sm ${msg.senderId === session?.user.id ? "bg-purple-600 text-white" : "bg-[#0a0a0f] text-gray-200"}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={sendMessage} className="p-3 border-t border-purple-900/30 flex gap-2">
                  <input
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    placeholder="Mesaj yaz..."
                    className="flex-1 bg-[#0a0a0f] border border-purple-900/40 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                  <button type="submit" className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl text-sm transition-colors">Gönder</button>
                </form>
              </div>
            ) : (
              <div className="bg-[#1a1a2e] border border-purple-900/30 rounded-2xl h-[500px] flex items-center justify-center text-gray-600">
                <div className="text-center">
                  <div className="text-5xl mb-3">💬</div>
                  <p>Mesajlaşmak için bir arkadaş seç</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
