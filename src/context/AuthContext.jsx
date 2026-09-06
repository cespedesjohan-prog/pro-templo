import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [session, setSession] = useState(null);
  const [usuario, setUsuario] = useState(null);

  // Perfil de public.perfiles
  const [perfil, setPerfil] = useState(null);

  const [cargando, setCargando] = useState(true);


  // ======================================
  // CARGAR PERFIL DEL USUARIO
  // ======================================

  async function cargarPerfil(userId) {

    if (!userId) {

      setPerfil(null);

      return null;
    }

    try {

      const {
        data,
        error,
      } = await supabase

        .from("perfiles")

       .select(`
         id,
         nombres,
         rol,
         activo,
         miembro_id
       `)

       .eq("id", userId)

       .maybeSingle();


     if (error) {

       console.error(
         "Error cargando perfil:",
         error
       );

       setPerfil(null);

       return null;
     }

     let perfilData = data ?? null;

     if (perfilData && perfilData.miembro_id) {
       const { data: miembroData, error: miembroError } = await supabase
         .from("miembros")
         .select("celula, ministerio")
         .eq("id", perfilData.miembro_id)
         .maybeSingle();

       if (!miembroError && miembroData) {
         perfilData = {
           ...perfilData,
           celula: miembroData.celula ?? null,
           ministerio: miembroData.ministerio ?? null,
         };
       }
     }


     setPerfil(perfilData);

     return perfilData;

    } catch (error) {

      console.error(
        "Error cargando perfil:",
        error
      );

      setPerfil(null);

      return null;
    }
  }


  // ======================================
  // CARGAR SESIÓN
  // ======================================

  useEffect(() => {

    let activo = true;


    async function cargarSesion() {

      try {

        const {
          data,
          error,
        } = await supabase.auth.getSession();


        if (error) {

          throw error;

        }


        if (!activo) return;


        const nuevaSesion =
          data.session ?? null;


        const nuevoUsuario =
          nuevaSesion?.user ?? null;


        setSession(nuevaSesion);

        setUsuario(nuevoUsuario);


        // Cargar perfil
        if (nuevoUsuario?.id) {

          await cargarPerfil(
            nuevoUsuario.id
          );

        } else {

          setPerfil(null);

        }


      } catch (error) {

        console.error(
          "Error cargando sesión:",
          error
        );

      } finally {

        if (activo) {

          setCargando(false);

        }

      }

    }


    cargarSesion();


    // ====================================
    // ESCUCHAR CAMBIOS DE AUTENTICACIÓN
    // ====================================

    const {
      data: {
        subscription,
      },
    } = supabase.auth.onAuthStateChange(

      async (
        event,
        nuevaSesion
      ) => {

        if (!activo) return;


        setSession(
          nuevaSesion ?? null
        );


        const nuevoUsuario =
          nuevaSesion?.user ?? null;


        setUsuario(
          nuevoUsuario
        );


        if (nuevoUsuario?.id) {

          await cargarPerfil(
            nuevoUsuario.id
          );

        } else {

          setPerfil(null);

        }

      }

    );


    return () => {

      activo = false;

      subscription.unsubscribe();

    };

  }, []);


  // ======================================
  // INICIAR SESIÓN
  // ======================================

  async function iniciarSesion(
    email,
    password
  ) {

    const {
      data,
      error,
    } = await supabase.auth.signInWithPassword({

      email: email.trim(),

      password,

    });


    if (error) {

      throw error;

    }


    setSession(
      data.session
    );


    setUsuario(
      data.user
    );


    // Cargar perfil inmediatamente
    let perfilActual = null;

    if (data.user?.id) {

      perfilActual = await cargarPerfil(
        data.user.id
      );

    }


    return perfilActual ?? data;

  }


  // ======================================
  // RECUPERAR CONTRASEÑA
  // ======================================

  async function solicitarRestablecimiento(email, redirectTo) {

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo }
    );

    if (error) {
      throw error;
    }

  }


  async function actualizarPassword(password) {

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      throw error;
    }

  }


  // ======================================
  // CERRAR SESIÓN
  // ======================================

  async function cerrarSesion() {

    const {
      error,
    } = await supabase.auth.signOut();


    if (error) {

      throw error;

    }


    setSession(null);

    setUsuario(null);

    setPerfil(null);

  }


  // ======================================
  // VALOR DEL CONTEXTO
  // ======================================

  return (

    <AuthContext.Provider
      value={{

        session,

        usuario,

        perfil,

        cargando,

        iniciarSesion,

        solicitarRestablecimiento,

        actualizarPassword,

        cerrarSesion,

        cargarPerfil,

      }}
    >

      {children}

    </AuthContext.Provider>

  );

}


// ========================================
// HOOK
// ========================================

export function useAuth() {

  const context =
    useContext(AuthContext);


  if (!context) {

    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider."
    );

  }


  return context;

}
