//============================================================================
// PROJECT ID:
//
// GROUP NUMBER:
//
// STUDENT NAME:
// NUS User ID.:
//
// STUDENT NAME:
// NUS User ID.:
//
// STUDENT NAME:
// NUS User ID.:
//
// COMMENTS TO GRADER:
//
//============================================================================


// FRAGMENT SHADER FOR SHADERTOY
// Run this at https://www.shadertoy.com/new
// See documentation at https://www.shadertoy.com/howto

// Your browser must support WebGL 2.0.
// Check your browser at https://webglreport.com/?v=2


//============================================================================
// Constants.
//============================================================================

const float PI = 3.1415926536;

const vec3 BACKGROUND_COLOR = vec3( 0.1, 0.2, 0.6 );

// Vertical field-of-view angle of camera. In radians.
const float FOVY = 50.0 * PI / 180.0;

// Use this for avoiding the "epsilon problem" or the shadow acne problem.
const float DEFAULT_TMIN = 10.0e-4;

// Use this for tmax for non-shadow ray intersection test.
const float DEFAULT_TMAX = 10.0e6;

// Equivalent to number of recursion levels (0 means ray-casting only).
// We are using iterations to replace recursions.
const int NUM_ITERATIONS = 2;

// Constants for the scene objects.
const int NUM_LIGHTS = 2;
const int NUM_MATERIALS = 10;
const int NUM_PLANES = 5;
const int NUM_SPHERES = 10;
const int NUM_CUBOIDS = 100;
const int NUM_PRISMS = 16;

//============================================================================
// Define new struct types.
//============================================================================
struct Ray_t {
    vec3 o;  // Ray Origin.
    vec3 d;  // Ray Direction. A unit vector.
};

struct Plane_t {
    // The plane equation is Ax + By + Cz + D = 0.
    float A, B, C, D;
    int materialID;
};

struct Sphere_t {
    vec3 center;
    float radius;
    int materialID;
};

struct Cuboid_t {
    vec3 minCorner; // The minimum corner (x_min, y_min, z_min)
    vec3 maxCorner; // The maximum corner (x_max, y_max, z_max)
    int materialID;
};

struct Prism_t {
    vec3 vertices[3]; //             
    float height;     //  ߶ 
    int materialID;
};

struct Light_t {
    vec3 position;  // Point light 3D position.
    vec3 I_a;       // For Ambient.
    vec3 I_source;  // For Diffuse and Specular.
};

struct Material_t {
    vec3 k_a;   // Ambient coefficient.
    vec3 k_d;   // Diffuse coefficient.
    vec3 k_r;   // Reflected specular coefficient.
    vec3 k_rg;  // Global reflection coefficient.
    float n;    // The specular reflection exponent. Ranges from 0.0 to 128.0.
};

//----------------------------------------------------------------------------
// The lighting model used here is similar to that shown in
// Lecture Topic B08 (Basic Ray Tracing). Here it is computed as
//
//     I_local = SUM_OVER_ALL_LIGHTS {
//                   I_a * k_a +
//                   k_shadow * I_source * [ k_d * (N.L) + k_r * (R.V)^n ]
//               }
// and
//     I = I_local  +  k_rg * I_reflected
//----------------------------------------------------------------------------


//============================================================================
// Global scene data.
//============================================================================
Plane_t Plane[NUM_PLANES];
Sphere_t Sphere[NUM_SPHERES];
Cuboid_t Cuboid[NUM_CUBOIDS];
Prism_t Prism[NUM_PRISMS];
Light_t Light[NUM_LIGHTS];
Material_t Material[NUM_MATERIALS];




/////////////////////////////////////////////////////////////////////////////
// Initializes the scene.
/////////////////////////////////////////////////////////////////////////////
void InitScene()
{
    // Horizontal plane.
    Plane[0].A = 0.0;
    Plane[0].B = 1.0;
    Plane[0].C = 0.0;
    Plane[0].D = 0.0;
    Plane[0].materialID = 0;

    // Vertical plane.
    Plane[1].A = 0.0;
    Plane[1].B = 0.0;
    Plane[1].C = 1.0;
    Plane[1].D = 25.0;
    Plane[1].materialID = 0;

    // Vertical plane.
    Plane[2].A = 0.0;
    Plane[2].B = 0.0;
    Plane[2].C = 1.0;
    Plane[2].D = -25.0;
    Plane[2].materialID = 5;

        
    // New vertical silver plane 
    Plane[3].A = 1.0; 
    Plane[3].B = 0.0;
    Plane[3].C = 0.0;
    Plane[3].D = -25.0; 
    Plane[3].materialID = 5; // Silver material

    // New vertical silver plane perpendicular to the other two planes.
    Plane[4].A = 1.0; // Normal vector in the x-direction
    Plane[4].B = 0.0;
    Plane[4].C = 0.0;
    Plane[4].D = 25.0; 
    Plane[4].materialID = 0; // Silver material

    //     
    Cuboid[0].minCorner = vec3(-17.0, 0.0, -17.0);
    Cuboid[0].maxCorner = vec3( 17.0, 0.2,  17.0);
    Cuboid[0].materialID = 0; 

    //   ɫ յ    
    Cuboid[1].minCorner = vec3( 0.5, 0.2, -0.5);
    Cuboid[1].maxCorner = vec3( 8.5, 0.4,  0.5);
    Cuboid[1].materialID = 4; 

    //   ɫ յ    
    Cuboid[2].minCorner = vec3(-0.5, 0.2, 0.5);
    Cuboid[2].maxCorner = vec3( 0.5, 0.4, 8.5);
    Cuboid[2].materialID = 3; 

     //   ɫ յ    
    Cuboid[3].minCorner = vec3(-8.5, 0.2, -0.5);
    Cuboid[3].maxCorner = vec3(-0.5, 0.4,  0.5);
    Cuboid[3].materialID = 1; 

    //   ɫ յ    
    Cuboid[4].minCorner = vec3(-0.5, 0.2, -8.5);
    Cuboid[4].maxCorner = vec3( 0.5, 0.4, -0.5);
    Cuboid[4].materialID = 2; 

    //·  
    Cuboid[5].minCorner = vec3( 6.5, 0.2, 0.5);
    Cuboid[5].maxCorner = vec3( 8.5, 0.4, 1.5);
    Cuboid[5].materialID = 3; 

    Cuboid[6].minCorner = vec3( 6.5, 0.2, 1.5);
    Cuboid[6].maxCorner = vec3( 8.5, 0.4, 2.5);
    Cuboid[6].materialID = 1; 

    Cuboid[7].minCorner = vec3( 6.5, 0.2, -1.5);
    Cuboid[7].maxCorner = vec3( 8.5, 0.4, -0.5);
    Cuboid[7].materialID = 2; 

    Cuboid[8].minCorner = vec3( 5.5, 0.2, 2.5);
    Cuboid[8].maxCorner = vec3( 6.5, 0.4, 4.5);
    Cuboid[8].materialID = 4; 

    Cuboid[9].minCorner = vec3( 4.5, 0.2, 2.5);
    Cuboid[9].maxCorner = vec3( 5.5, 0.4, 4.5);
    Cuboid[9].materialID = 3; 

    Cuboid[10].minCorner = vec3( 2.5, 0.2, 4.5);
    Cuboid[10].maxCorner = vec3( 4.5, 0.4, 5.5);
    Cuboid[10].materialID = 4; 

    Cuboid[11].minCorner = vec3( 2.5, 0.2, 5.5);
    Cuboid[11].maxCorner = vec3( 4.5, 0.4, 6.5);
    Cuboid[11].materialID = 3; 

    Cuboid[12].minCorner = vec3( 1.5, 0.2, 6.5);
    Cuboid[12].maxCorner = vec3( 2.5, 0.4, 8.5);
    Cuboid[12].materialID = 2; 

    Cuboid[13].minCorner = vec3( 0.5, 0.2, 6.5);
    Cuboid[13].maxCorner = vec3( 1.5, 0.4, 8.5);
    Cuboid[13].materialID = 4; 

    Cuboid[14].minCorner = vec3(-1.5, 0.2, 6.5);
    Cuboid[14].maxCorner = vec3(-0.5, 0.4, 8.5);
    Cuboid[14].materialID = 1;

    Cuboid[15].minCorner = vec3(-2.5, 0.2, 6.5);
    Cuboid[15].maxCorner = vec3(-1.5, 0.4, 8.5);
    Cuboid[15].materialID = 2;

    Cuboid[16].minCorner = vec3(-4.5, 0.2, 5.5);
    Cuboid[16].maxCorner = vec3(-2.5, 0.4, 6.5);
    Cuboid[16].materialID = 3;

    Cuboid[17].minCorner = vec3(-4.5, 0.2, 4.5);
    Cuboid[17].maxCorner = vec3(-2.5, 0.4, 5.5);
    Cuboid[17].materialID = 1;

    Cuboid[18].minCorner = vec3(-5.5, 0.2, 2.5);
    Cuboid[18].maxCorner = vec3(-4.5, 0.4, 4.5);
    Cuboid[18].materialID = 3;

    Cuboid[19].minCorner = vec3(-6.5, 0.2, 2.5);
    Cuboid[19].maxCorner = vec3(-5.5, 0.4, 4.5);
    Cuboid[19].materialID = 1;

    Cuboid[20].minCorner = vec3(-8.5, 0.2, 1.5);
    Cuboid[20].maxCorner = vec3(-6.5, 0.4, 2.5);
    Cuboid[20].materialID = 4;

    Cuboid[21].minCorner = vec3(-8.5, 0.2, 0.5);
    Cuboid[21].maxCorner = vec3(-6.5, 0.4, 1.5);
    Cuboid[21].materialID = 3;

    Cuboid[22].minCorner = vec3(-8.5, 0.2, -0.5);
    Cuboid[22].maxCorner = vec3(-6.5, 0.4, -1.5);
    Cuboid[22].materialID = 2;

    Cuboid[23].minCorner = vec3(-8.5, 0.2, -1.5);
    Cuboid[23].maxCorner = vec3(-6.5, 0.4, -2.5);
    Cuboid[23].materialID = 4;

    Cuboid[24].minCorner = vec3(-6.5, 0.2, -4.5);
    Cuboid[24].maxCorner = vec3(-5.5, 0.4, -2.5);
    Cuboid[24].materialID = 1;

    Cuboid[25].minCorner = vec3(-5.5, 0.2, -4.5);
    Cuboid[25].maxCorner = vec3(-4.5, 0.4, -2.5);
    Cuboid[25].materialID = 2;

    Cuboid[26].minCorner = vec3(-4.5, 0.2, -5.5);
    Cuboid[26].maxCorner = vec3(-2.5, 0.4, -4.5);
    Cuboid[26].materialID = 1;

    Cuboid[27].minCorner = vec3(-4.5, 0.2, -6.5);
    Cuboid[27].maxCorner = vec3(-2.5, 0.4, -5.5);
    Cuboid[27].materialID = 2;

    Cuboid[28].minCorner = vec3(-2.5, 0.2, -8.5);
    Cuboid[28].maxCorner = vec3(-1.5, 0.4, -6.5);
    Cuboid[28].materialID = 3;

    Cuboid[29].minCorner = vec3(-1.5, 0.2, -8.5);
    Cuboid[29].maxCorner = vec3(-0.5, 0.4, -6.5);
    Cuboid[29].materialID = 1;

    Cuboid[30].minCorner = vec3( 0.5, 0.2, -8.5);
    Cuboid[30].maxCorner = vec3( 1.5, 0.4, -6.5);
    Cuboid[30].materialID = 4;

    Cuboid[31].minCorner = vec3( 1.5, 0.2, -8.5);
    Cuboid[31].maxCorner = vec3( 2.5, 0.4, -6.5);
    Cuboid[31].materialID = 3;

    Cuboid[32].minCorner = vec3( 2.5, 0.2, -6.5);
    Cuboid[32].maxCorner = vec3( 4.5, 0.4, -5.5);
    Cuboid[32].materialID = 2;

    Cuboid[33].minCorner = vec3( 2.5, 0.2, -5.5);
    Cuboid[33].maxCorner = vec3( 4.5, 0.4, -4.5);
    Cuboid[33].materialID = 4;

    Cuboid[34].minCorner = vec3( 4.5, 0.2, -4.5);
    Cuboid[34].maxCorner = vec3( 5.5, 0.4, -2.5);
    Cuboid[34].materialID = 2;

    Cuboid[35].minCorner = vec3( 5.5, 0.2, -4.5);
    Cuboid[35].maxCorner = vec3( 6.5, 0.4, -2.5);
    Cuboid[35].materialID = 4;

    Cuboid[36].minCorner = vec3( 6.5, 0.2, -2.5);
    Cuboid[36].maxCorner = vec3( 8.5, 0.4, -1.5);
    Cuboid[36].materialID = 1;

    // Initialize a triangular prism
    Prism[0].vertices[0] = vec3( 6.5, 0.2, 2.5);
    Prism[0].vertices[1] = vec3( 6.5, 0.2, 4.5);
    Prism[0].vertices[2] = vec3( 8.5, 0.2, 2.5);
    Prism[0].height = 0.2;
    Prism[0].materialID = 2; 

    Prism[1].vertices[0] = vec3( 2.5, 0.2, 2.5);
    Prism[1].vertices[1] = vec3( 4.5, 0.2, 2.5);
    Prism[1].vertices[2] = vec3( 4.5, 0.2, 4.5);
    Prism[1].height = 0.2;
    Prism[1].materialID = 1; 

    Prism[2].vertices[0] = vec3( 2.5, 0.2, 2.5);
    Prism[2].vertices[1] = vec3( 4.5, 0.2, 4.5);
    Prism[2].vertices[2] = vec3( 2.5, 0.2, 4.5);
    Prism[2].height = 0.2;
    Prism[2].materialID = 2; 

    Prism[3].vertices[0] = vec3(2.5, 0.2, 6.5);
    Prism[3].vertices[1] = vec3(4.5, 0.2, 6.5);
    Prism[3].vertices[2] = vec3(2.5, 0.2, 8.5);
    Prism[3].height = 0.2;
    Prism[3].materialID = 1; 

    Prism[4].vertices[0] = vec3(-2.5, 0.2, 6.5);
    Prism[4].vertices[1] = vec3(-2.5, 0.2, 8.5);
    Prism[4].vertices[2] = vec3(-4.5, 0.2, 6.5);
    Prism[4].height = 0.2;
    Prism[4].materialID = 4; 

    Prism[5].vertices[0] = vec3(-2.5, 0.2, 2.5);
    Prism[5].vertices[1] = vec3(-2.5, 0.2, 4.5);
    Prism[5].vertices[2] = vec3(-4.5, 0.2, 4.5);
    Prism[5].height = 0.2;
    Prism[5].materialID = 2; 

    Prism[6].vertices[0] = vec3(-4.5, 0.2, 2.5);
    Prism[6].vertices[1] = vec3(-2.5, 0.2, 2.5);
    Prism[6].vertices[2] = vec3(-4.5, 0.2, 4.5);
    Prism[6].height = 0.2;
    Prism[6].materialID = 4; 

    Prism[7].vertices[0] = vec3(-8.5, 0.2, 2.5);
    Prism[7].vertices[1] = vec3(-6.5, 0.2, 2.5);
    Prism[7].vertices[2] = vec3(-6.5, 0.2, 4.5);
    Prism[7].height = 0.2;
    Prism[7].materialID = 2;
    
    Prism[8].vertices[0] = vec3(-8.5, 0.2, -2.5);
    Prism[8].vertices[1] = vec3(-6.5, 0.2, -2.5);
    Prism[8].vertices[2] = vec3(-6.5, 0.2, -4.5);
    Prism[8].height = 0.2;
    Prism[8].materialID = 3;

    Prism[9].vertices[0] = vec3(-2.5, 0.2, -2.5);
    Prism[9].vertices[1] = vec3(-4.5, 0.2, -2.5);
    Prism[9].vertices[2] = vec3(-4.5, 0.2, -4.5);
    Prism[9].height = 0.2;
    Prism[9].materialID = 4;

    Prism[10].vertices[0] = vec3(-2.5, 0.2, -2.5);
    Prism[10].vertices[1] = vec3(-2.5, 0.2, -4.5);
    Prism[10].vertices[2] = vec3(-4.5, 0.2, -4.5);
    Prism[10].height = 0.2;
    Prism[10].materialID = 3;

    Prism[11].vertices[0] = vec3(-2.5, 0.2, -6.5);
    Prism[11].vertices[1] = vec3(-2.5, 0.2, -8.5);
    Prism[11].vertices[2] = vec3(-4.5, 0.2, -6.5);
    Prism[11].height = 0.2;
    Prism[11].materialID = 4;

    Prism[12].vertices[0] = vec3( 2.5, 0.2, -6.5);
    Prism[12].vertices[1] = vec3( 2.5, 0.2, -8.5);
    Prism[12].vertices[2] = vec3( 4.5, 0.2, -6.5);
    Prism[12].height = 0.2;
    Prism[12].materialID = 1;

    Prism[13].vertices[0] = vec3( 2.5, 0.2, -2.5);
    Prism[13].vertices[1] = vec3( 2.5, 0.2, -4.5);
    Prism[13].vertices[2] = vec3( 4.5, 0.2, -4.5);
    Prism[13].height = 0.2;
    Prism[13].materialID = 3;

    Prism[14].vertices[0] = vec3( 2.5, 0.2, -2.5);
    Prism[14].vertices[1] = vec3( 4.5, 0.2, -2.5);
    Prism[14].vertices[2] = vec3( 4.5, 0.2, -4.5);
    Prism[14].height = 0.2;
    Prism[14].materialID = 1;

    Prism[15].vertices[0] = vec3( 6.5, 0.2, -2.5);
    Prism[15].vertices[1] = vec3( 6.5, 0.2, -4.5);
    Prism[15].vertices[2] = vec3( 8.5, 0.2, -2.5);
    Prism[15].height = 0.2;
    Prism[15].materialID = 3;

    // Silver material.
    Material[0].k_d = vec3( 0.5, 0.5, 0.5 );
    Material[0].k_a = 0.2 * Material[0].k_d;
    Material[0].k_r = 2.0 * Material[0].k_d;
    Material[0].k_rg = 0.5 * Material[0].k_r;
    Material[0].n = 64.0;

    // Gold material.
    Material[1].k_d = vec3( 0.8, 0.7, 0.2 );
    Material[1].k_a = 0.2 * Material[1].k_d;
    Material[1].k_r = 2.0 * Material[1].k_d;
    Material[1].k_rg = 0.5 * Material[1].k_r;
    Material[1].n = 64.0;

    // Green plastic material.
    Material[2].k_d = vec3( 0.0, 0.8, 0.4 );
    Material[2].k_a = 0.2 * Material[2].k_d;
    Material[2].k_r = vec3( 1.0, 1.0, 1.0 );
    Material[2].k_rg = 0.5 * Material[2].k_r;
    Material[2].n = 128.0;

    // Blue plastic material.
    Material[3].k_d = vec3( 0.5, 0.8, 0.9 );
    Material[3].k_a = 0.2 * Material[3].k_d;
    Material[3].k_r = vec3( 1.0, 1.0, 1.0 );
    Material[3].k_rg = 0.5 * Material[3].k_r;
    Material[3].n = 128.0;
    
    // Red plastic material.
    Material[4].k_d = vec3( 0.8, 0.2, 0.5 );
    Material[4].k_a = 0.2 * Material[4].k_d;
    Material[4].k_r = vec3(1.0, 1.0, 1.0);
    Material[4].k_rg = 0.5 * Material[4].k_r;
    Material[4].n = 128.0;
    
    // non-reflective purple material.
    Material[5].k_d = vec3(1.0, 1.0, 1.0);
    Material[5].k_a = 0.2 * Material[5].k_d;
    Material[5].k_r = vec3(0.0, 0.0, 0.0); // No reflection
    Material[5].k_rg = vec3(0.0, 0.0, 0.0); // No global reflection
    Material[5].n = 0.0;

    // Light 0.
    Light[0].position = vec3( 10.0, 15.0, -10.0 );
    Light[0].I_a = vec3( 1.0, 0.8, 0.6  );
    Light[0].I_source = vec3( 0.8, 0.7, 0.6 );

    // Light 1.
    Light[1].position = vec3( -10.0 , 15.0, 10.0 );
    Light[1].I_a = vec3( 1.0, 1.0, 1.0 );
    Light[1].I_source = vec3( 0.5, 0.6, 0.7 );
}



/////////////////////////////////////////////////////////////////////////////
// Computes intersection between a plane and a ray.
// Returns true if there is an intersection where the ray parameter t is
// between tmin and tmax, otherwise returns false.
// If there is such an intersection, outputs the value of t, the position
// of the intersection (hitPos) and the normal vector at the intersection
// (hitNormal).
/////////////////////////////////////////////////////////////////////////////
bool IntersectPlane( in Plane_t pln, in Ray_t ray, in float tmin, in float tmax,
                     out float t, out vec3 hitPos, out vec3 hitNormal )
{
    vec3 N = vec3( pln.A, pln.B, pln.C );
    float NRd = dot( N, ray.d );
    float NRo = dot( N, ray.o );
    float t0 = (-pln.D - NRo) / NRd;
    if ( t0 < tmin || t0 > tmax ) return false;

    // We have a hit -- output results.
    t = t0;
    hitPos = ray.o + t0 * ray.d;
    hitNormal = normalize( N );
    return true;
}

bool IntersectCuboid(in Cuboid_t cuboid, in Ray_t ray, in float tmin, in float tmax, out float t, out vec3 hitPos, out vec3 hitNormal) {
    vec3 invD = 1.0 / ray.d;
    vec3 t0s = (cuboid.minCorner - ray.o) * invD;
    vec3 t1s = (cuboid.maxCorner - ray.o) * invD;

    vec3 tsmaller = min(t0s, t1s);
    vec3 tbigger = max(t0s, t1s);

    float tminbox = max(max(tsmaller.x, tsmaller.y), tsmaller.z);
    float tmaxbox = min(min(tbigger.x, tbigger.y), tbigger.z);

    if (tminbox > tmaxbox || tmaxbox < tmin) return false;

    t = tminbox > tmin ? tminbox : tmaxbox;

    if (t < tmin || t > tmax) return false;

    hitPos = ray.o + t * ray.d;
    if (t == t0s.x) hitNormal = vec3(-sign(ray.d.x), 0.0, 0.0);
    else if (t == t1s.x) hitNormal = vec3(sign(ray.d.x), 0.0, 0.0);
    else if (t == t0s.y) hitNormal = vec3(0.0, -sign(ray.d.y), 0.0);
    else if (t == t1s.y) hitNormal = vec3(0.0, sign(ray.d.y), 0.0);
    else if (t == t0s.z) hitNormal = vec3(0.0, 0.0, -sign(ray.d.z));
    else hitNormal = vec3(0.0, 0.0, sign(ray.d.z));

    return true;
}


bool IntersectTriangle(in vec3 v0, in vec3 v1, in vec3 v2, in Ray_t ray, in float tmin, in float tmax, out float t, out vec3 hitPos, out vec3 hitNormal) {
    vec3 edge1 = v1 - v0;
    vec3 edge2 = v2 - v0;
    vec3 h = cross(ray.d, edge2);
    float a = dot(edge1, h);
    if (a > -DEFAULT_TMIN && a < DEFAULT_TMIN)
        return false; // This ray is parallel to this triangle.
    float f = 1.0 / a;
    vec3 s = ray.o - v0;
    float u = f * dot(s, h);
    if (u < 0.0 || u > 1.0)
        return false;
    vec3 q = cross(s, edge1);
    float v = f * dot(ray.d, q);
    if (v < 0.0 || u + v > 1.0)
        return false;
    float temp_t = f * dot(edge2, q);
    if (temp_t > tmin && temp_t < tmax) {
        t = temp_t;
        hitPos = ray.o + ray.d * t;
        hitNormal = normalize(cross(edge1, edge2));
        return true;
    }
    return false;
}

bool IntersectPrism(in Prism_t prism, in Ray_t ray, in float tmin, in float tmax, out float t, out vec3 hitPos, out vec3 hitNormal) {
    bool hit = false;
    t = tmax;

    // Check intersection with the bottom face (triangle)
    for (int i = 0; i < 3; i++) {
        vec3 v0 = prism.vertices[i];
        vec3 v1 = prism.vertices[(i + 1) % 3];
        vec3 v2 = prism.vertices[(i + 2) % 3];
        float temp_t;
        vec3 temp_hitPos, temp_hitNormal;
        if (IntersectTriangle(v0, v1, v2, ray, tmin, t, temp_t, temp_hitPos, temp_hitNormal)) {
            hit = true;
            if (temp_t < t) {
                t = temp_t;
                hitPos = temp_hitPos;
                hitNormal = temp_hitNormal;
            }
        }
    }

    // Check intersection with the top face (triangle)
    for (int i = 0; i < 3; i++) {
        vec3 v0 = prism.vertices[i] + vec3(0.0, prism.height, 0.0);
        vec3 v1 = prism.vertices[(i + 1) % 3] + vec3(0.0, prism.height, 0.0);
        vec3 v2 = prism.vertices[(i + 2) % 3] + vec3(0.0, prism.height, 0.0);
        float temp_t;
        vec3 temp_hitPos, temp_hitNormal;
        if (IntersectTriangle(v0, v1, v2, ray, tmin, t, temp_t, temp_hitPos, temp_hitNormal)) {
            hit = true;
            if (temp_t < t) {
                t = temp_t;
                hitPos = temp_hitPos;
                hitNormal = temp_hitNormal;
            }
        }
    }

    // Check intersection with the side faces (parallelograms)
    for (int i = 0; i < 3; i++) {
        vec3 v0 = prism.vertices[i];
        vec3 v1 = prism.vertices[(i + 1) % 3];
        vec3 v2 = prism.vertices[i] + vec3(0.0, prism.height, 0.0);
        vec3 v3 = prism.vertices[(i + 1) % 3] + vec3(0.0, prism.height, 0.0);
        // Side face 1 (v0, v1, v3)
        float temp_t;
        vec3 temp_hitPos, temp_hitNormal;
        if (IntersectTriangle(v0, v1, v3, ray, tmin, t, temp_t, temp_hitPos, temp_hitNormal)) {
            hit = true;
            if (temp_t < t) {
                t = temp_t;
                hitPos = temp_hitPos;
                hitNormal = temp_hitNormal;
            }
        }
        // Side face 2 (v0, v3, v2)
        if (IntersectTriangle(v0, v3, v2, ray, tmin, t, temp_t, temp_hitPos, temp_hitNormal)) {
            hit = true;
            if (temp_t < t) {
                t = temp_t;
                hitPos = temp_hitPos;
                hitNormal = temp_hitNormal;
            }
        }
    }

    return hit;
}

/////////////////////////////////////////////////////////////////////////////
// Computes intersection between a plane and a ray.
// Returns true if there is an intersection where the ray parameter t is
// between tmin and tmax, otherwise returns false.
/////////////////////////////////////////////////////////////////////////////
bool IntersectPlane( in Plane_t pln, in Ray_t ray, in float tmin, in float tmax )
{
    vec3 N = vec3( pln.A, pln.B, pln.C );
    float NRd = dot( N, ray.d );
    float NRo = dot( N, ray.o );
    float t0 = (-pln.D - NRo) / NRd;
    if ( t0 < tmin || t0 > tmax ) return false;
    return true;
}



/////////////////////////////////////////////////////////////////////////////
// Computes intersection between a sphere and a ray.
// Returns true if there is an intersection where the ray parameter t is
// between tmin and tmax, otherwise returns false.
// If there is one or two such intersections, outputs the value of the
// smaller t, the position of the intersection (hitPos) and the normal
// vector at the intersection (hitNormal).
/////////////////////////////////////////////////////////////////////////////
bool IntersectSphere( in Sphere_t sph, in Ray_t ray, in float tmin, in float tmax,
                      out float t, out vec3 hitPos, out vec3 hitNormal )
{
    /////////////////////////////////
    // TASK: WRITE YOUR CODE HERE. //
    /////////////////////////////////

    


    vec3 oc = ray.o - sph.center;
    float a = dot(ray.d, ray.d);
    float b = 2.0 * dot(oc, ray.d);
    float c = dot(oc, oc) - sph.radius * sph.radius;
    float discriminant = b * b - 4.0 * a * c;
    if (discriminant < 0.0) return false;

    float sqrtDiscriminant = sqrt(discriminant);
    float t0 = (-b - sqrtDiscriminant) / (2.0 * a);
    float t1 = (-b + sqrtDiscriminant) / (2.0 * a);

    if (t0 > tmin && t0 < tmax) {
        t = t0;
        hitPos = ray.o + t0 * ray.d;
        hitNormal = normalize(hitPos - sph.center);
        return true;
    } else if (t1 > tmin && t1 < tmax) {
        t = t1;
        hitPos = ray.o + t1 * ray.d;
        hitNormal = normalize(hitPos - sph.center);
        return true;
    }
    return false;
}



/////////////////////////////////////////////////////////////////////////////
// Computes intersection between a sphere and a ray.
// Returns true if there is an intersection where the ray parameter t is
// between tmin and tmax, otherwise returns false.
/////////////////////////////////////////////////////////////////////////////
bool IntersectSphere( in Sphere_t sph, in Ray_t ray, in float tmin, in float tmax )
{
    /////////////////////////////////
    // TASK: WRITE YOUR CODE HERE. //
    /////////////////////////////////

    



    vec3 oc = ray.o - sph.center;
    float a = dot(ray.d, ray.d);
    float b = 2.0 * dot(oc, ray.d);
    float c = dot(oc, oc) - sph.radius * sph.radius;
    float discriminant = b * b - 4.0 * a * c;
    if (discriminant < 0.0) return false;

    float sqrtDiscriminant = sqrt(discriminant);
    float t0 = (-b - sqrtDiscriminant) / (2.0 * a);
    float t1 = (-b + sqrtDiscriminant) / (2.0 * a);

    if (t0 > tmin && t0 < tmax) {
        return true;
    } else if (t1 > tmin && t1 < tmax) {
        return true;
    }
    return false;
}



/////////////////////////////////////////////////////////////////////////////
// Computes (I_a * k_a) + k_shadow * I_source * [ k_d * (N.L) + k_r * (R.V)^n ].
// Input vectors L, N and V are pointing AWAY from surface point.
// Assume all vectors L, N and V are unit vectors.
/////////////////////////////////////////////////////////////////////////////
vec3 PhongLighting( in vec3 L, in vec3 N, in vec3 V, in bool inShadow,
                    in Material_t mat, in Light_t light )
{
    if ( inShadow ) {
        return light.I_a * mat.k_a;
    }
    else {
        vec3 R = reflect( -L, N );
        float N_dot_L = max( 0.0, dot( N, L ) );
        float R_dot_V = max( 0.0, dot( R, V ) );
        float R_dot_V_pow_n = ( R_dot_V == 0.0 )? 0.0 : pow( R_dot_V, mat.n );

        return light.I_a * mat.k_a +
               light.I_source * (mat.k_d * N_dot_L + mat.k_r * R_dot_V_pow_n);
    }
}



/////////////////////////////////////////////////////////////////////////////
// Casts a ray into the scene and returns color computed at the nearest
// intersection point. The color is the sum of light from all light sources,
// each computed using Phong Lighting Model, with consideration of
// whether the interesection point is being shadowed from the light.
// If there is no interesection, returns the background color, and outputs
// hasHit as false.
// If there is intersection, returns the computed color, and outputs
// hasHit as true, the 3D position of the intersection (hitPos), the
// normal vector at the intersection (hitNormal), and the k_rg value
// of the material of the intersected object.
/////////////////////////////////////////////////////////////////////////////
vec3 CastRay( in Ray_t ray,
              out bool hasHit, out vec3 hitPos, out vec3 hitNormal, out vec3 k_rg )
{
    // Find whether and where the ray hits some object.
    // Take the nearest hit point.

    bool hasHitSomething = false;
    float nearest_t = DEFAULT_TMAX;   // The ray parameter t at the nearest hit point.
    vec3 nearest_hitPos;              // 3D position of the nearest hit point.
    vec3 nearest_hitNormal;           // Normal vector at the nearest hit point.
    int nearest_hitMatID;             // MaterialID of the object at the nearest hit point.

    float temp_t;
    vec3 temp_hitPos;
    vec3 temp_hitNormal;
    bool temp_hasHit;

    /////////////////////////////////////////////////////////////////////////////
    // TASK:
    // * Try interesecting input ray with all the planes and spheres,
    //   and record the front-most (nearest) interesection.
    // * If there is interesection, need to record hasHitSomething,
    //   nearest_t, nearest_hitPos, nearest_hitNormal, nearest_hitMatID.
    /////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////
    // TASK: WRITE YOUR CODE HERE. //
    /////////////////////////////////





    // Try intersecting input ray with all the planes and spheres,
    // and record the front-most (nearest) intersection.
    for (int i = 0; i < NUM_PLANES; i++) {
        if (IntersectPlane(Plane[i], ray, DEFAULT_TMIN, nearest_t, temp_t, temp_hitPos, temp_hitNormal)) {
            hasHitSomething = true;
            nearest_t = temp_t;
            nearest_hitPos = temp_hitPos;
            nearest_hitNormal = temp_hitNormal;
            nearest_hitMatID = Plane[i].materialID;
        }
    }
    for (int i = 0; i < NUM_SPHERES; i++) {
        if (IntersectSphere(Sphere[i], ray, DEFAULT_TMIN, nearest_t, temp_t, temp_hitPos, temp_hitNormal)) {
            hasHitSomething = true;
            nearest_t = temp_t;
            nearest_hitPos = temp_hitPos;
            nearest_hitNormal = temp_hitNormal;
            nearest_hitMatID = Sphere[i].materialID;
        }
    }

    // Add intersection code for cuboids
    for (int i = 0; i < NUM_CUBOIDS; i++) {
        if (IntersectCuboid(Cuboid[i], ray, DEFAULT_TMIN, nearest_t, temp_t, temp_hitPos, temp_hitNormal)) {
            hasHitSomething = true;
            nearest_t = temp_t;
            nearest_hitPos = temp_hitPos;
            nearest_hitNormal = temp_hitNormal;
            nearest_hitMatID = Cuboid[i].materialID;
        }
    }

     // Add intersection code for prisms
    for (int i = 0; i < NUM_PRISMS; i++) {
        if (IntersectPrism(Prism[i], ray, DEFAULT_TMIN, nearest_t, temp_t, temp_hitPos, temp_hitNormal)) {
            hasHitSomething = true;
            nearest_t = temp_t;
            nearest_hitPos = temp_hitPos;
            nearest_hitNormal = temp_hitNormal;
            nearest_hitMatID = Prism[i].materialID;
        }
    }


    // One of the output results.
    hasHit = hasHitSomething;
    if ( !hasHitSomething ) return BACKGROUND_COLOR;

    vec3 I_local = vec3( 0.0 );  // Result color will be accumulated here.

    /////////////////////////////////////////////////////////////////////////////
    // TASK:
    // * Accumulate lighting from each light source on the nearest hit point.
    //   They are all accumulated into I_local.
    // * For each light source, make a shadow ray, and check if the shadow ray
    //   intersects any of the objects (the planes and spheres) between the
    //   nearest hit point and the light source.
    // * Then, call PhongLighting() to compute lighting for this light source.
    /////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////
    // TASK: WRITE YOUR CODE HERE. //
    /////////////////////////////////





    // Accumulate lighting from each light source on the nearest hit point.
    for (int i = 0; i < NUM_LIGHTS; i++) {
        vec3 lightDir = normalize(Light[i].position - nearest_hitPos);
        vec3 shadowRayDir = lightDir;
        Ray_t shadowRay = Ray_t(nearest_hitPos + DEFAULT_TMIN * shadowRayDir, shadowRayDir);

        bool inShadow = false;
        for (int j = 0; j < NUM_PLANES; j++) {
            if (IntersectPlane(Plane[j], shadowRay, DEFAULT_TMIN, length(Light[i].position - nearest_hitPos))) {
                inShadow = true;
                break;
            }
        }

        if (!inShadow) {
            for (int j = 0; j < NUM_SPHERES; j++) {
                if (IntersectSphere(Sphere[j], shadowRay, DEFAULT_TMIN, length(Light[i].position - nearest_hitPos))) {
                    inShadow = true;
                    break;
                }
            }
        }

        vec3 viewDir = normalize(-ray.d);
        I_local += PhongLighting(lightDir, nearest_hitNormal, viewDir, inShadow, Material[nearest_hitMatID], Light[i]);
    }



    // Populate output results.
    hitPos = nearest_hitPos;
    hitNormal = nearest_hitNormal;
    k_rg = Material[nearest_hitMatID].k_rg;

    return I_local;
}



/////////////////////////////////////////////////////////////////////////////
// Execution of fragment shader starts here.
// 1. Initializes the scene.
// 2. Compute a primary ray for the current pixel (fragment).
// 3. Trace ray into the scene with NUM_ITERATIONS recursion levels.
/////////////////////////////////////////////////////////////////////////////
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    InitScene();

    // Scale pixel 2D position such that its y coordinate is in [-1.0, 1.0].
    vec2 pixel_pos = (2.0 * fragCoord.xy - iResolution.xy) / iResolution.y;

    // Position the camera.
    float angle = iTime; //  ı Ƕȼ  㷽ʽ
    vec3 cam_pos = vec3(0.0, 8.0, 6.5); //  ı    λ  

    vec3 cam_lookat = vec3(0.0, 1.0, 0.0);
    vec3 cam_up_vec = vec3(0.0, 1.0, 0.0);

    // Set up camera coordinate frame in world space.
    vec3 cam_z_axis = normalize(cam_pos - cam_lookat);
    vec3 cam_x_axis = normalize(cross(cam_up_vec, cam_z_axis));
    vec3 cam_y_axis = cross(cam_z_axis, cam_x_axis);

    // Create primary ray.
    float pixel_pos_z = -1.0 / tan(FOVY / 2.0);
    Ray_t pRay;
    pRay.o = cam_pos;
    pRay.d = normalize(pixel_pos.x * cam_x_axis + pixel_pos.y * cam_y_axis + pixel_pos_z * cam_z_axis);

    // Start Ray Tracing.
    // Use iterations to emulate the recursion.

    vec3 I_result = vec3(0.0);
    vec3 compounded_k_rg = vec3(1.0);
    Ray_t nextRay = pRay;
    
    for (int level = 0; level <= NUM_ITERATIONS; level++) {
        bool hasHit;
        vec3 hitPos, hitNormal, k_rg;

        vec3 I_local = CastRay(nextRay, hasHit, hitPos, hitNormal, k_rg);

        I_result += compounded_k_rg * I_local;

        if (!hasHit) break;

        compounded_k_rg *= k_rg;

        nextRay = Ray_t(hitPos, normalize(reflect(nextRay.d, hitNormal)));
    }

    fragColor = vec4(I_result, 1.0);
}
