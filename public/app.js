const db = supabase.createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_PUBLISHABLE_KEY);
const $ = (id) => document.getElementById(id);
const LABELS = { satisfied: ['😊 만족', '#10b981'], neutral: ['😐 보통', '#f59e0b'], dissatisfied: ['😞 불만족', '#ef4444'] };

function show(view) {
  for (const v of ['studentView', 'loginView', 'adminView']) $(v).hidden = v !== view;
  $('loginBtn').hidden = view !== 'studentView';
}

document.querySelectorAll('.vote').forEach((btn) => {
  btn.onclick = async () => {
    const all = document.querySelectorAll('.vote');
    all.forEach((b) => (b.disabled = true));
    const msg = $('studentMsg');
    msg.className = 'msg';
    msg.textContent = '';
    const { error } = await db.from('votes').insert({ rating: btn.dataset.rating });
    if (error) {
      msg.className = 'msg error';
      msg.textContent = '저장에 실패했습니다. 다시 시도해 주세요.';
    } else {
      msg.textContent = '투표가 완료되었습니다. 감사합니다.';
    }
    all.forEach((b) => (b.disabled = false));
  };
});

$('loginBtn').onclick = () => show('loginView');
$('cancelLogin').onclick = () => show('studentView');

$('loginForm').onsubmit = async (e) => {
  e.preventDefault();
  $('loginMsg').textContent = '';
  const { error } = await db.auth.signInWithPassword({ email: $('email').value, password: $('password').value });
  if (error) {
    $('loginMsg').textContent = '로그인에 실패했습니다. 이메일과 비밀번호를 확인하세요.';
    return;
  }
  $('password').value = '';
  show('adminView');
  loadResults();
};

async function loadResults() {
  $('adminMsg').textContent = '';
  const counts = { satisfied: 0, neutral: 0, dissatisfied: 0 };
  for (const key of Object.keys(counts)) {
    const { count, error } = await db.from('votes').select('*', { count: 'exact', head: true }).eq('rating', key);
    if (error) {
      $('adminMsg').textContent = '결과를 불러오지 못했습니다.';
      return;
    }
    counts[key] = count;
  }
  render(counts);
}

function render(counts) {
  const total = counts.satisfied + counts.neutral + counts.dissatisfied;
  $('total').textContent = total;
  $('bars').innerHTML = Object.entries(counts).map(([k, n]) => {
    const pct = total ? Math.round((n / total) * 1000) / 10 : 0;
    return `<div class="bar-row"><span>${LABELS[k][0]}</span><div class="track"><div class="fill" style="width:${pct}%;background:${LABELS[k][1]}"></div></div><span>${n}표 (${pct}%)</span></div>`;
  }).join('');
}

$('refreshBtn').onclick = loadResults;

$('resetBtn').onclick = async () => {
  if (!confirm('모든 투표 결과를 초기화하시겠습니까? 삭제된 결과는 복구할 수 없습니다.')) return;
  const { error } = await db.from('votes').delete().gte('id', 0);
  if (error) {
    $('adminMsg').textContent = '초기화에 실패했습니다.';
    return;
  }
  render({ satisfied: 0, neutral: 0, dissatisfied: 0 });
};

$('logoutBtn').onclick = async () => {
  await db.auth.signOut();
  show('studentView');
};

db.auth.getSession().then(({ data }) => {
  if (data.session) {
    show('adminView');
    loadResults();
  } else {
    show('studentView');
  }
});
