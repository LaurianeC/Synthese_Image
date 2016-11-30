#ifndef GLSHADERWINDOW_H
#define GLSHADERWINDOW_H

#include "openglwindow.h"
#include "TriMesh.h"

#include <QtGui/QGuiApplication>
#include <QtGui/QMatrix4x4>
#include <QtGui/QOpenGLShaderProgram>
#include <QOpenGLFramebufferObject>
#include <QOpenGLBuffer>
#include <QOpenGLTexture>
#include <QtGui/QOpenGLVertexArrayObject>
#include <QtGui/QScreen>
#include <QMouseEvent>


class glShaderWindow : public OpenGLWindow
{
    Q_OBJECT
public:
    glShaderWindow(QWindow *parent = 0);
    ~glShaderWindow();

    void initialize();
    void render();
    void resize(int x, int y);
    void setWorkingDirectory(QString& myPath, QString& myName, QString& texture, QString& envMap);
    inline const QStringList& fragShaderSuffix() { return m_fragShaderSuffix;};
    inline const QStringList& vertShaderSuffix() { return m_vertShaderSuffix;};

public slots:
    void openSceneFromFile();
    void openNewTexture();
    void openNewEnvMap();
    void saveScene();
    void toggleFullScreen();
    void saveScreenshot();
    void showAuxWindow();
    void setWindowSize(const QString& size);
    void setShader(const QString& size);
    void phongClicked();
    void blinnPhongClicked();
    void skyboxChanged(int state) ;
    void transparentClicked();
    void opaqueClicked();
    void updateLightIntensity(int lightSliderValue);
    void updateShininess(int shininessSliderValue);
    void updateEta(int etaSliderValue);
    void updateNSamples(int nSamplesSliderValue);
    void updateBias(int biasSliderValue);

protected:
    void mousePressEvent(QMouseEvent *e);
    void mouseMoveEvent(QMouseEvent *e);
    void mouseReleaseEvent(QMouseEvent *e);
    void timerEvent(QTimerEvent *e);
    void resizeEvent(QResizeEvent * ev);
    void wheelEvent(QWheelEvent * ev);


private:
    QOpenGLShaderProgram* prepareShaderProgram(const QString& vertexShaderPath, const QString& fragmentShaderPath);
    void bindSceneToProgram();
    void initializeTransformForScene();
    void initPermTexture();
    void loadTexturesForShaders();
    void openScene();
    void mouseToTrackball(QVector2D &in, QVector3D &out);

    // Model we are displaying:
    QString  workingDirectory;
    QString  modelName;
    QString  textureName;
    QString  envMapName;
    trimesh::TriMesh* modelMesh;
    uchar* pixels;
    // Ground
    trimesh::point *g_vertices;
    trimesh::vec *g_normals;
    trimesh::vec2 *g_texcoords;
    trimesh::point *g_colors;
    int *g_indices;
    int g_numPoints;
    int g_numIndices;
    //Skybox
    trimesh::point *s_vertices;
    trimesh::vec *s_normals;
    trimesh::vec2 *s_texcoords;
    trimesh::point *s_colors;
    int *s_indices;
    int s_numPoints;
    int s_numIndices;
    // Parameters controlled by UI
    bool blinnPhong;
    bool transparent;
    bool skybox_checked = false ;

    float eta;
    int nSamples_softShadow;
    float bias;
    float lightIntensity;
    float shininess;
    float lightDistance;
    float groundDistance;
    float skyboxDistance ; // ???


    // OpenGL variables encapsulated by Qt
    QOpenGLShaderProgram *m_program;
    QOpenGLShaderProgram *ground_program;
    QOpenGLShaderProgram *shadowMapGenerationProgram;
    QOpenGLShaderProgram *skybox_program;

    QOpenGLTexture* environmentMap;
    QOpenGLTexture* texture;
    QOpenGLTexture* normalMap;
    QOpenGLTexture* permTexture;
    // Model
    QOpenGLBuffer m_vertexBuffer;
    QOpenGLBuffer m_indexBuffer;
    QOpenGLBuffer m_normalBuffer;
    QOpenGLBuffer m_colorBuffer;
    QOpenGLBuffer m_texcoordBuffer;
    QOpenGLVertexArrayObject m_vao;
    // Ground
    QOpenGLVertexArrayObject ground_vao;
    QOpenGLBuffer ground_vertexBuffer;
    QOpenGLBuffer ground_indexBuffer;
    QOpenGLBuffer ground_normalBuffer;
    QOpenGLBuffer ground_colorBuffer;
    QOpenGLBuffer ground_texcoordBuffer;
    //Skybox
    QOpenGLVertexArrayObject skybox_vao;
    QOpenGLBuffer skybox_vertexBuffer;
    QOpenGLBuffer skybox_indexBuffer;
    QOpenGLBuffer skybox_normalBuffer;
    QOpenGLBuffer skybox_colorBuffer;
    QOpenGLBuffer skybox_texcoordBuffer;

    // Matrix for all objects
    QMatrix4x4 m_matrix[4]; // 0 = object, 1 = light, 2 = ground, 3 = skybox
    QMatrix4x4 m_perspective;
    // Shadow mapping
    QOpenGLFramebufferObject* shadowMap;
    int shadowMapDimension;

    // User interface variables
    bool fullScreenSnapshots;
    QStringList m_fragShaderSuffix;
    QStringList m_vertShaderSuffix;
    QVector2D lastMousePosition;
    QVector3D lastTBPosition;
    Qt::MouseButton mouseButton;
    float m_screenSize; // max window dimension
    QWidget* auxWidget; // window for parameters

};

#endif // GLSHADERWINDOW_H
