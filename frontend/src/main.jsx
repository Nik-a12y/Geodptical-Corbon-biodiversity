
// import React, {useEffect, useState} from 'react';
// import {createRoot} from 'react-dom/client';
// import {BrowserRouter, Routes, Route, Link, useNavigate, useParams} from 'react-router-dom';
// import axios from 'axios';
// import {Line} from 'react-chartjs-2';
// import {Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend} from 'chart.js';
// import './styles.css';
// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

// const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
// const api = axios.create({baseURL: API});
// api.interceptors.request.use(c => {const t=localStorage.getItem('token'); if(t)c.headers.Authorization=`Bearer ${t}`; return c});

// function Layout({children}) {
//   const nav=useNavigate();
//   const logout=()=>{localStorage.clear();nav('/login')};
//   return <div className="app"><aside><h2>🌳 Darukaa</h2><p className="muted">Earth Analytics</p>
//     <Link to="/">Dashboard</Link><Link to="/projects">Projects</Link><button onClick={logout}>Logout</button>
//   </aside><main>{children}</main></div>
// }

// function Login({register=false}) {
//  const nav=useNavigate(); const [form,setForm]=useState({name:'',email:'',password:''}); const [err,setErr]=useState('');
//  const submit=async e=>{e.preventDefault();try{if(register){await api.post('/auth/register',form);nav('/login')}else{let r=await api.post('/auth/login',form);localStorage.setItem('token',r.data.access_token);nav('/')}}catch(x){setErr(x.response?.data?.detail||'Something went wrong')}};
//  return <div className="auth"><div className="card auth-card"><h1>🌳 Darukaa.Earth</h1><p>Geospatial Carbon & Biodiversity Platform</p>
//    <h2>{register?'Create account':'Welcome back'}</h2><form onSubmit={submit}>
//    {register&&<input placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>}
//    <input placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
//    <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
//    <button className="primary">{register?'Register':'Login'}</button></form>{err&&<p className="error">{err}</p>}
//    <p>{register?'Already have an account? ':'New here? '}<Link to={register?'/login':'/register'}>{register?'Login':'Register'}</Link></p>
//  </div></div>
// }

// function Dashboard(){
//  const [projects,setProjects]=useState([]); const nav=useNavigate();
//  useEffect(()=>{api.get('/projects').then(r=>setProjects(r.data)).catch(()=>nav('/login'))},[]);
//  return <Layout><h1>Dashboard</h1><div className="grid stats"><div className="card"><b>{projects.length}</b><span>Total Projects</span></div><div className="card"><b>{projects.reduce((a,p)=>a+p.sites,0)}</b><span>Total Sites</span></div><div className="card"><b>78%</b><span>Demo Performance</span></div></div>
//  <div className="card"><div className="row"><h2>Projects</h2><Link className="primary small" to="/projects">Manage Projects</Link></div>{projects.length===0?<p>No projects yet. Create your first project.</p>:projects.map(p=><div className="list" key={p.id}><div><b>{p.name}</b><p>{p.description}</p></div><Link to={`/projects/${p.id}`}>Open →</Link></div>)}</div></Layout>
// }

// function Projects(){
//  const [projects,setProjects]=useState([]); const [name,setName]=useState(''); const [desc,setDesc]=useState('');
//  const load=()=>api.get('/projects').then(r=>setProjects(r.data));
//  useEffect(load,[]);
//  const add=async e=>{e.preventDefault();await api.post('/projects',{name,description:desc});setName('');setDesc('');load()};
//  return <Layout><h1>Projects</h1><div className="grid two"><div className="card"><h2>Create Project</h2><form onSubmit={add}><input placeholder="Project name" value={name} onChange={e=>setName(e.target.value)} required/><textarea placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)}/><button className="primary">Create Project</button></form></div><div className="card"><h2>Your Projects</h2>{projects.map(p=><div className="list" key={p.id}><span><b>{p.name}</b><small>{p.sites} sites</small></span><Link to={`/projects/${p.id}`}>View</Link></div>)}</div></div></Layout>
// }

// function ProjectDetail(){
//  const {id}=useParams(); const [p,setP]=useState(null); const [form,setForm]=useState({name:'',latitude:'',longitude:'',area_hectares:''});
//  const load=()=>api.get(`/projects/${id}`).then(r=>setP(r.data)); useEffect(load,[]);
//  const add=async e=>{e.preventDefault();await api.post(`/projects/${id}/sites`,{...form,latitude:+form.latitude,longitude:+form.longitude,area_hectares:+form.area_hectares});setForm({name:'',latitude:'',longitude:'',area_hectares:''});load()};
//  if(!p)return <Layout><p>Loading...</p></Layout>;
//  return <Layout><h1>{p.name}</h1><p>{p.description}</p><div className="grid two"><div className="card"><h2>Map / Add Site</h2><div className="map"><div className="map-pin">📍</div><p>Mapbox-ready map area</p><small>Add coordinates below. Set VITE_MAPBOX_TOKEN for Mapbox integration.</small></div><form onSubmit={add}><input placeholder="Site name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/><div className="row"><input placeholder="Latitude" value={form.latitude} onChange={e=>setForm({...form,latitude:e.target.value})} required/><input placeholder="Longitude" value={form.longitude} onChange={e=>setForm({...form,longitude:e.target.value})} required/></div><input placeholder="Area (hectares)" value={form.area_hectares} onChange={e=>setForm({...form,area_hectares:e.target.value})}/><button className="primary">Add Site</button></form></div><div className="card"><h2>Sites</h2>{p.sites.length===0?<p>No sites yet.</p>:p.sites.map(s=><div className="list" key={s.id}><span><b>{s.name}</b><small>{s.area_hectares} hectares</small></span><Link to={`/sites/${s.id}`}>Analytics →</Link></div>)}</div></div></Layout>
// }

// function Analytics(){
//  const {id}=useParams(); const [a,setA]=useState(null); useEffect(()=>{api.get(`/sites/${id}/analytics`).then(r=>setA(r.data))},[]);
//  if(!a)return <Layout><p>Loading analytics...</p></Layout>;
//  const data={labels:a.months,datasets:[{label:'Carbon',data:a.carbon},{label:'Biodiversity',data:a.biodiversity}]};
//  return <Layout><h1>{a.site.name} Analytics</h1><div className="grid stats"><div className="card"><b>{a.site.area_hectares}</b><span>Hectares</span></div><div className="card"><b>{a.performance}%</b><span>Performance</span></div></div><div className="card chart"><h2>Performance Over Time</h2><Line data={data}/></div></Layout>
// }

// function App(){
//  return <Routes><Route path="/login" element={<Login/>}/><Route path="/register" element={<Login register/>}/><Route path="/" element={<Dashboard/>}/><Route path="/projects" element={<Projects/>}/><Route path="/projects/:id" element={<ProjectDetail/>}/><Route path="/sites/:id" element={<Analytics/>}/></Routes>
// }
// createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);






import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import axios from "axios";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";


import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";


import "./styles.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

// ===============================
// API
// ===============================

const API =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API,
});

// Automatically send JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ===============================
// LAYOUT
// ===============================

function Layout({ children }) {
  const nav = useNavigate();

  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

  return (
    <div className="app">
      <aside>
        <h2>🌳 Darukaa</h2>

        <p className="muted">Earth Analytics</p>

        <Link to="/">Dashboard</Link>

        <Link to="/projects">Projects</Link>

        <button onClick={logout}>Logout</button>
      </aside>

      <main>{children}</main>
    </div>
  );
}

// ===============================
// LOGIN / REGISTER
// ===============================

function Login({ register = false }) {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    setErr("");

    try {
      if (register) {
        await api.post("/auth/register", form);

        nav("/login");
      } else {
        const response = await api.post("/auth/login", {
          email: form.email,
          password: form.password,
        });

        localStorage.setItem(
          "token",
          response.data.access_token
        );

        nav("/");
      }
    } catch (error) {
      console.error(error);

      setErr(
        error.response?.data?.detail ||
          "Something went wrong"
      );
    }
  };

  return (
    <div className="auth">
      <div className="card auth-card">
        <h1>🌳 Darukaa.Earth</h1>

        <p>
          Geospatial Carbon & Biodiversity Platform
        </p>

        <h2>
          {register ? "Create account" : "Welcome back"}
        </h2>

        <form onSubmit={submit}>
          {register && (
            <input
              placeholder="Full name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              required
            />
          )}

          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            required
          />

          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            required
          />

          <button className="primary">
            {register ? "Register" : "Login"}
          </button>
        </form>

        {err && <p className="error">{err}</p>}

        <p>
          {register
            ? "Already have an account? "
            : "New here? "}

          <Link
            to={register ? "/login" : "/register"}
          >
            {register ? "Login" : "Register"}
          </Link>
        </p>
      </div>
    </div>
  );
}

// ===============================
// DASHBOARD
// ===============================

function Dashboard() {
  const [projects, setProjects] = useState([]);

  const nav = useNavigate();

  useEffect(() => {
    api
      .get("/projects")
      .then((response) => {
        setProjects(response.data);
      })
      .catch((error) => {
        console.error(error);
        nav("/login");
      });
  }, [nav]);

  const totalSites = projects.reduce(
    (total, project) =>
      total + (project.sites || 0),
    0
  );

  return (
    <Layout>
      <h1>Dashboard</h1>

      <div className="grid stats">
        <div className="card">
          <b>{projects.length}</b>
          <span>Total Projects</span>
        </div>

        <div className="card">
          <b>{totalSites}</b>
          <span>Total Sites</span>
        </div>

        <div className="card">
          <b>78%</b>
          <span>Demo Performance</span>
        </div>
      </div>

      <div className="card">
        <div className="row">
          <h2>Projects</h2>

          <Link
            className="primary small"
            to="/projects"
          >
            Manage Projects
          </Link>
        </div>

        {projects.length === 0 ? (
          <p>No projects yet. Create your first project.</p>
        ) : (
          projects.map((project) => (
            <div
              className="list"
              key={project.id}
            >
              <div>
                <b>{project.name}</b>

                <p>{project.description}</p>
              </div>

              <Link
                to={`/projects/${project.id}`}
              >
                Open →
              </Link>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}

// ===============================
// PROJECTS
// ===============================

function Projects() {
  const [projects, setProjects] = useState([]);

  const [name, setName] = useState("");

  const [desc, setDesc] = useState("");

  const load = () => {
    api
      .get("/projects")
      .then((response) => {
        setProjects(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();

    try {
      await api.post("/projects", {
        name,
        description: desc,
      });

      setName("");

      setDesc("");

      load();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Unable to create project"
      );
    }
  };

  return (
    <Layout>
      <h1>Projects</h1>

      <div className="grid two">
        <div className="card">
          <h2>Create Project</h2>

          <form onSubmit={add}>
            <input
              placeholder="Project name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />

            <textarea
              placeholder="Description"
              value={desc}
              onChange={(e) =>
                setDesc(e.target.value)
              }
            />

            <button className="primary">
              Create Project
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Your Projects</h2>

          {projects.length === 0 ? (
            <p>No projects yet.</p>
          ) : (
            projects.map((project) => (
              <div
                className="list"
                key={project.id}
              >
                <span>
                  <b>{project.name}</b>

                  <small>
                    {project.sites || 0} sites
                  </small>
                </span>

                <Link
                  to={`/projects/${project.id}`}
                >
                  View
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

// ===============================
// PROJECT DETAIL + MAPBOX
// ===============================

function ProjectDetail() {
  const { id } = useParams();

  // Keep the Mapbox instances outside React state so re-renders do not
  // recreate the map or lose the polygon being drawn.
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);

  const [project, setProject] = useState(null);

  const [form, setForm] = useState({ name: "", latitude: "", longitude: "", area_hectares: "", geometry: null });
  const [notice, setNotice] = useState("");

  // Load project
  const loadProject = async () => {
    try {
      const response = await api.get(
        `/projects/${id}`
      );

      setProject(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  // ===============================
  // INITIALIZE MAPBOX
  // ===============================

  useEffect(() => {
    const token =
      import.meta.env.VITE_MAPBOX_TOKEN;

    if (!token) {
      console.error(
        "VITE_MAPBOX_TOKEN is missing in frontend/.env"
      );

      return;
    }

    if (!mapContainer.current) {
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,

      style:
        "mapbox://styles/mapbox/satellite-streets-v12",

      center: [78.9629, 20.5937],

      zoom: 4,
      
    });
    map.current.on("load", () => {
      const features = (project?.sites || []).flatMap((site) => {
        try {
          const raw = site.geometry || site.polygon || site.boundary;
          const geometry = typeof raw === "string" ? JSON.parse(raw) : raw;
          if (geometry?.type === "Feature") return [{ ...geometry, properties: { ...geometry.properties, name: site.name, area: site.area_hectares } }];
          if (["Polygon", "MultiPolygon"].includes(geometry?.type)) return [{ type: "Feature", properties: { name: site.name, area: site.area_hectares }, geometry }];
        } catch { /* legacy site falls back to its centroid pin */ }
        return Number.isFinite(Number(site.longitude)) && Number.isFinite(Number(site.latitude))
          ? [{ type: "Feature", properties: { name: site.name, area: site.area_hectares }, geometry: { type: "Point", coordinates: [Number(site.longitude), Number(site.latitude)] } }]
          : [];
      });
      map.current.addSource("saved-sites", { type: "geojson", data: { type: "FeatureCollection", features } });
      map.current.addLayer({ id: "saved-site-fill", type: "fill", source: "saved-sites", filter: ["==", "$type", "Polygon"], paint: { "fill-color": "#16a36a", "fill-opacity": 0.28 } });
      map.current.addLayer({ id: "saved-site-outline", type: "line", source: "saved-sites", filter: ["==", "$type", "Polygon"], paint: { "line-color": "#d9ffe9", "line-width": 2 } });
      map.current.addLayer({ id: "saved-site-pins", type: "circle", source: "saved-sites", filter: ["==", "$type", "Point"], paint: { "circle-radius": 7, "circle-color": "#16a36a", "circle-stroke-color": "#fff", "circle-stroke-width": 2 } });
    });

    map.current.addControl(
      new mapboxgl.NavigationControl(),
      "top-right"
    );
    map.current.on("error", (event) => {
  console.error("❌ MAPBOX ERROR:", event.error);
});

    draw.current = new MapboxDraw({
      displayControlsDefault: false,

      controls: {
        polygon: true,
        trash: true,
      },

      defaultMode: "draw_polygon",
    });

    map.current.addControl(
      draw.current,
      "top-left"
    );

    // Polygon created
    map.current.on("draw.create", (event) => {
      const feature = event.features[0];

      if (!feature) return;

      try {
        const areaInSquareMeters =
          turf.area(feature);

        const areaInHectares =
          areaInSquareMeters / 10000;

        const center =
          turf.centroid(feature);

        const [
          longitude,
          latitude,
        ] = center.geometry.coordinates;

        setForm((previous) => ({
          ...previous,

          latitude:
            latitude.toFixed(6),

          longitude:
            longitude.toFixed(6),

          area_hectares:
            areaInHectares.toFixed(4),

          // GeoJSON coordinates are [longitude, latitude], ready for PostGIS.
          geometry: feature.geometry,
        }));
      } catch (error) {
        console.error(
          "Polygon calculation error:",
          error
        );
      }
    });

    // Editing a vertex must recalculate the area too; clearing must invalidate the form.
    map.current.on("draw.update", (event) => {
      const feature = event.features[0];
      if (!feature) return;
      const [longitude, latitude] = turf.centroid(feature).geometry.coordinates;
      setForm((previous) => ({ ...previous, latitude: latitude.toFixed(6), longitude: longitude.toFixed(6), area_hectares: (turf.area(feature) / 10000).toFixed(4), geometry: feature.geometry }));
    });
    map.current.on("draw.delete", () => {
      setForm((previous) => ({ ...previous, latitude: "", longitude: "", area_hectares: "", geometry: null }));
    });

    return () => {
      if (map.current) {
        map.current.remove();

        map.current = null;
      }

      draw.current = null;
    };
  }, [project]);

  // ===============================
  // ADD SITE
  // ===============================

  const addSite = async (e) => {
    e.preventDefault();

    try {
      if (
        !form.latitude ||
        !form.longitude ||
        !form.area_hectares
      ) {
        alert(
          "Please draw a polygon on the map first."
        );

        return;
      }

      await api.post(
        `/projects/${id}/sites`,
        {
          name: form.name,

          latitude: Number(form.latitude),

          longitude: Number(form.longitude),

          area_hectares:
            Number(form.area_hectares),

          geometry: form.geometry,
        }
      );

      alert("Site added successfully!");

      setForm({
        name: "",
        latitude: "",
        longitude: "",
        area_hectares: "",
        geometry: null,
      });

      if (draw.current) {
        draw.current.deleteAll();
      }

      await loadProject();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Something went wrong while adding site."
      );
    }
  };

  // ===============================
  // LOADING
  // ===============================

  if (!project) {
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );
  }

  // ===============================
  // PAGE
  // ===============================

  return (
    <Layout>
      <h1>{project.name}</h1>

      <p>{project.description}</p>

      <div className="grid two">

        {/* ================= MAP ================= */}

        <div className="card">
          <h2>Map / Add Site</h2>

          {/* <div
            ref={mapContainer}
            style={{
              width: "100%",
              height: "400px",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          /> */}
          <div
  ref={mapContainer}
  style={{
    width: "100%",
    height: "400px",
    minHeight: "400px",
    background: "#ddd",
    borderRadius: "12px",
    overflow: "hidden",
  }}
></div>

          <p className="muted">
            Draw a polygon on the map. Area,
            latitude and longitude will be
            calculated automatically.
          </p>

          <form onSubmit={addSite}>
            <input
              placeholder="Site name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              required
            />

            <div className="row">
              <input
                placeholder="Latitude"
                value={form.latitude}
                onChange={(e) =>
                  setForm({
                    ...form,
                    latitude: e.target.value,
                  })
                }
                readOnly
                required
              />

              <input
                placeholder="Longitude"
                value={form.longitude}
                onChange={(e) =>
                  setForm({
                    ...form,
                    longitude:
                      e.target.value,
                  })
                }
                readOnly
                required
              />
            </div>

            <input
              placeholder="Area (hectares)"
              value={form.area_hectares}
              onChange={(e) =>
                setForm({
                  ...form,
                  area_hectares:
                    e.target.value,
                })
              }
              readOnly
              required
            />

            <button className="primary">
              Add Site
            </button>
          </form>
        </div>

        {/* ================= SITES ================= */}

        <div className="card">
          <h2>Sites</h2>

          {!project.sites ||
          project.sites.length === 0 ? (
            <p>No sites yet.</p>
          ) : (
            project.sites.map((site) => (
              <div
                className="list"
                key={site.id}
              >
                <span>
                  <b>{site.name}</b>

                  <small>
                    {site.area_hectares} hectares
                  </small>
                </span>

                <Link
                  to={`/sites/${site.id}`}
                >
                  Analytics →
                </Link>
              </div>
            ))
          )}
        </div>

      </div>
    </Layout>
  );
}

// ===============================
// ANALYTICS
// ===============================

function Analytics() {
  const { id } = useParams();

  const [analytics, setAnalytics] =
    useState(null);

  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/sites/${id}/analytics`)
      .then((response) => {
        setAnalytics(response.data);
      })
      .catch((error) => {
        console.error(error);

        setError(
          error.response?.data?.detail ||
            "Unable to load analytics"
        );
      });
  }, [id]);

  if (error) {
    return (
      <Layout>
        <p className="error">{error}</p>
      </Layout>
    );
  }

  if (!analytics) {
    return (
      <Layout>
        <p>Loading analytics...</p>
      </Layout>
    );
  }

  const performanceSeries = analytics.performance_over_time || analytics.performance_history || analytics.performance_series || [];
  const chartData = {
    labels: analytics.months || performanceSeries.map((point) => point.month || point.date),
    datasets: [{
      label: "Performance (%)",
      data: Array.isArray(performanceSeries) && typeof performanceSeries[0] === "object"
        ? performanceSeries.map((point) => point.value ?? point.performance)
        : performanceSeries.length ? performanceSeries : (analytics.months || []).map(() => analytics.performance ?? 0),
      borderColor: "#16734b",
      backgroundColor: "rgba(22, 115, 75, 0.14)",
      fill: true,
      tension: 0.35,
      pointRadius: 4,
    }],
  };
  const chartOptions = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100, ticks: { callback: (value) => `${value}%` } } }, plugins: { legend: { display: false } } };

  return (
    <Layout>
      <h1>
        {analytics.site.name} Analytics
      </h1>

      <div className="grid stats">
        <div className="card">
          <b>
            {analytics.site.area_hectares}
          </b>

          <span>Hectares</span>
        </div>

        <div className="card">
          <b>
            {analytics.performance}%
          </b>

          <span>Performance</span>
        </div>
      </div>

      <div className="card chart">
        <h2>Performance Over Time</h2>
        <div className="chart-canvas"><Line data={chartData} options={chartOptions} /></div>
      </div>
    </Layout>
  );
}

// ===============================
// APP
// ===============================

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Login register />}
      />

      <Route
        path="/"
        element={<Dashboard />}
      />

      <Route
        path="/projects"
        element={<Projects />}
      />

      <Route
        path="/projects/:id"
        element={<ProjectDetail />}
      />

      <Route
        path="/sites/:id"
        element={<Analytics />}
      />
    </Routes>
  );
}

// ===============================
// RENDER
// ===============================

createRoot(
  document.getElementById("root")
).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
