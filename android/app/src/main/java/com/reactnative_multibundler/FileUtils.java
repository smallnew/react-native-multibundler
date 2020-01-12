package com.reactnative_multibundler;

import android.app.Activity;
import android.content.Context;
import android.content.res.AssetManager;
import android.util.Log;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.Closeable;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.lang.ref.WeakReference;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class FileUtils {
    public static final String PACKAGE_FILE_NAME = "app.json";
    public static final String PACKAGE_HASH_KEY = "md5";
    public static final String UNZIPPED_FOLDER_NAME = "unzipped";
    public static final String FOLDER_RN = "bundles";//目标目录
    public static final String REACT_NATIVE_FILE = "index.android.bundle";

    public static final String STATUS_FILE = "code_rn.json";

    public static final int DOWNLOAD_BUFFER_SIZE = 1024 * 256;
    private static final int WRITE_BUFFER_SIZE = 1024 * 8;
    private static WeakReference<Activity> rnActivityRef;
    private static final String TAG = "FileUtils";

    public static final String BUNDLE_DOWNLOADPATH = "bundle-downloaded";//下载目录
    public static final String RN_NAME = "rnbundle";//临时下载名

    public static String appendPathComponent(String basePath, String appendPathComponent) {
        return new File(basePath, appendPathComponent).getAbsolutePath();
    }

    public static void downloadRNBundle(final Context context,final String url,final String md5,final UpdateProgressListener listener){
        final String downloadPath = context.getFilesDir()+ File.separator+BUNDLE_DOWNLOADPATH;
        final String fileName = RN_NAME;
        new Thread(new Runnable() {
            @Override
            public void run() {
                boolean result = true;
                try {
                    boolean tmpRet = FileUtils.downloadFile(url, downloadPath, fileName,listener);
                    if(!tmpRet){
                        result = false;
                    }else {
                        String filePath = downloadPath+ File.separator+fileName;
                        String successStr = FileUtils.processRnPackage(context, md5, filePath);
                        if (!"success".equals(successStr)) {
                            result = false;
                        }
                    }
                }catch (Exception e){
                    result = false;
                }finally {
                    if(listener!=null){
                        listener.complete(result);
                    }
                }
            }
        }).start();
    }

    /**
     * 下载后的解压操作，这里是没有md5校验的，md5只作为一个目录来使用，实际中请自行添加md5校验
     * @param context
     * @param md5 下载的文件的md5，这个可由服务端提供，这里的demo由于没服务端因此只当中目录
     * @param path 下载完的bundle的路径
     * @return
     */
    public static String processRnPackage(Context context,String md5,String path){
        String ret = "failed";
        try {
            File downloadFile = new File(path);
            String newUpdateHash = md5;
            String newUpdateFolderPath = getPackageFolderPath(context, newUpdateHash);
            String newUpdateMetadataPath = appendPathComponent(newUpdateFolderPath, PACKAGE_FILE_NAME);
            if (fileAtPathExists(newUpdateFolderPath)) {
                // This removes any stale data in newPackageFolderPath that could have been left
                // uncleared due to a crash or error during the download or install process.
                deleteDirectoryAtPath(newUpdateFolderPath);
            }
            // Unzip the downloaded file and then delete the zip
            String unzippedFolderPath = appendPathComponent(getRNCodePath(context), UNZIPPED_FOLDER_NAME);
            FileUtils.unzipFile(downloadFile, unzippedFolderPath);
            FileUtils.deleteFileOrFolderSilently(downloadFile);

            FileUtils.copyDirectoryContents(unzippedFolderPath, newUpdateFolderPath);
            FileUtils.deleteFileAtPathSilently(unzippedFolderPath);
            String relativeBundlePath = newUpdateFolderPath;
            FileUtils.writeStringToFile(md5, appendPathComponent(getRNCodePath(context),STATUS_FILE));//用该文件判断当前最新版本
            FileUtils.writeStringToFile(md5, newUpdateMetadataPath);
            ret = "success";
        }catch (Exception e){
            Log.e(TAG,"react native 解压bundle失败");
            e.printStackTrace();
        }
        return ret;
    }

    public static boolean downloadFile(String url,String fileForder,String fileName,UpdateProgressListener listener) throws IOException{
        String downloadUrlString = url;
        HttpURLConnection connection = null;
        BufferedInputStream bin = null;
        FileOutputStream fos = null;
        BufferedOutputStream bout = null;
        File downloadFile = null;
        boolean result = false;
        // Download the file while checking if it is a zip and notifying client of progress.
        try {
            URL downloadUrl = new URL(downloadUrlString);
            connection = (HttpURLConnection) (downloadUrl.openConnection());
            connection.setRequestProperty("Accept-Encoding", "identity");
            bin = new BufferedInputStream(connection.getInputStream());

            long totalBytes = connection.getContentLength();
            long receivedBytes = 0;

            File downloadFolder = new File(fileForder);
            downloadFolder.mkdirs();
            downloadFile = new File(downloadFolder, fileName);
            fos = new FileOutputStream(downloadFile);
            bout = new BufferedOutputStream(fos, DOWNLOAD_BUFFER_SIZE);
            byte[] data = new byte[DOWNLOAD_BUFFER_SIZE];
            byte[] header = new byte[4];

            int numBytesRead = 0;
            while ((numBytesRead = bin.read(data, 0, DOWNLOAD_BUFFER_SIZE)) >= 0) {
                if (receivedBytes < 4) {
                    for (int i = 0; i < numBytesRead; i++) {
                        int headerOffset = (int) (receivedBytes) + i;
                        if (headerOffset >= 4) {
                            break;
                        }

                        header[headerOffset] = data[i];
                    }
                }

                receivedBytes += numBytesRead;
                bout.write(data, 0, numBytesRead);
                listener.updateProgressChange((int)(receivedBytes*100/totalBytes));
            }

            if (totalBytes != receivedBytes) {
                throw new IOException("Received " + receivedBytes + " bytes, expected " + totalBytes);
            }
            result = true;
        } catch (MalformedURLException e) {
            throw new IOException(downloadUrlString, e);
        } finally {
            try {
                if (bout != null) bout.close();
                if (fos != null) fos.close();
                if (bin != null) bin.close();
                if (connection != null) connection.disconnect();
            } catch (IOException e) {
                throw new IOException("Error closing IO resources.", e);
            }
        }
        return result;
    }

    public static void copyDirectoryContents(String sourceDirectoryPath, String destinationDirectoryPath) throws IOException {
        File sourceDir = new File(sourceDirectoryPath);
        File destDir = new File(destinationDirectoryPath);
        if (!destDir.exists()) {
            destDir.mkdir();
        }

        for (File sourceFile : sourceDir.listFiles()) {
            if (sourceFile.isDirectory()) {
                copyDirectoryContents(
                        appendPathComponent(sourceDirectoryPath, sourceFile.getName()),
                        appendPathComponent(destinationDirectoryPath, sourceFile.getName()));
            } else {
                File destFile = new File(destDir, sourceFile.getName());
                FileInputStream fromFileStream = null;
                BufferedInputStream fromBufferedStream = null;
                FileOutputStream destStream = null;
                byte[] buffer = new byte[WRITE_BUFFER_SIZE];
                try {
                    fromFileStream = new FileInputStream(sourceFile);
                    fromBufferedStream = new BufferedInputStream(fromFileStream);
                    destStream = new FileOutputStream(destFile);
                    int bytesRead;
                    while ((bytesRead = fromBufferedStream.read(buffer)) > 0) {
                        destStream.write(buffer, 0, bytesRead);
                    }
                } finally {
                    try {
                        if (fromFileStream != null) fromFileStream.close();
                        if (fromBufferedStream != null) fromBufferedStream.close();
                        if (destStream != null) destStream.close();
                    } catch (IOException e) {
                        throw new IOException("Error closing IO resources.", e);
                    }
                }
            }
        }
    }

    public static void deleteDirectoryAtPath(String directoryPath) {
        if (directoryPath == null) {
            Log.e(TAG,"deleteDirectoryAtPath attempted with null directoryPath");
            return;
        }
        File file = new File(directoryPath);
        if (file.exists()) {
            deleteFileOrFolderSilently(file);
        }
    }

    public static void deleteFileAtPathSilently(String path) {
        deleteFileOrFolderSilently(new File(path));
    }

    public static void deleteFileOrFolderSilently(File file) {
        if (file.isDirectory()) {
            File[] files = file.listFiles();
            for (File fileEntry : files) {
                if (fileEntry.isDirectory()) {
                    deleteFileOrFolderSilently(fileEntry);
                } else {
                    fileEntry.delete();
                }
            }
        }

        if (!file.delete()) {
            Log.e(TAG,"Error deleting file " + file.getName());
        }
    }

    public static String getRNCodePath(Context context) {
        String codePath = appendPathComponent(context.getFilesDir().getAbsolutePath(), FOLDER_RN);
        return codePath;
    }

    public static String getPackageFolderPath(Context context,String packageHash) {
        return appendPathComponent(getRNCodePath(context), packageHash);
    }

    public static String getCurrentPackageMd5(Context context) {
        String statusFilePath = appendPathComponent(getRNCodePath(context), "code_rn.json");
        String content = null;
        try {
            content = readFileToString(statusFilePath);
        }catch (Exception e){
            e.printStackTrace();
        }

        if (content == null) {
            return content;
        } else {
            content.replace('\n', ' ');
            return content.trim();
        }
    }

    public static boolean fileAtPathExists(String filePath) {
        return new File(filePath).exists();
    }

    public static void moveFile(File fileToMove, String newFolderPath, String newFileName) throws IOException{
        File newFolder = new File(newFolderPath);
        if (!newFolder.exists()) {
            newFolder.mkdirs();
        }

        File newFilePath = new File(newFolderPath, newFileName);
        if (!fileToMove.renameTo(newFilePath)) {
            throw new IOException("Unable to move file from " +
                    fileToMove.getAbsolutePath() + " to " + newFilePath.getAbsolutePath() + ".");
        }
    }

    public static String readFileToString(String filePath) throws IOException {
        FileInputStream fin = null;
        BufferedReader reader = null;
        try {
            File fl = new File(filePath);
            fin = new FileInputStream(fl);
            reader = new BufferedReader(new InputStreamReader(fin));
            StringBuilder sb = new StringBuilder();
            String line = null;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }

            return sb.toString();
        } finally {
            if (reader != null) reader.close();
            if (fin != null) fin.close();
        }
    }

    public static void unzipFile(File zipFile, String destination) throws IOException {
        FileInputStream fileStream = null;
        BufferedInputStream bufferedStream = null;
        ZipInputStream zipStream = null;
        try {
            fileStream = new FileInputStream(zipFile);
            bufferedStream = new BufferedInputStream(fileStream);
            zipStream = new ZipInputStream(bufferedStream);
            ZipEntry entry;

            File destinationFolder = new File(destination);
            if (destinationFolder.exists()) {
                deleteFileOrFolderSilently(destinationFolder);
            }
            
            destinationFolder.mkdirs();

            byte[] buffer = new byte[WRITE_BUFFER_SIZE];
            while ((entry = zipStream.getNextEntry()) != null) {
                String fileName = entry.getName();
                File file = new File(destinationFolder, fileName);
                if (entry.isDirectory()) {
                    file.mkdirs();
                } else {
                    File parent = file.getParentFile();
                    if (!parent.exists()) {
                        parent.mkdirs();
                    }

                    FileOutputStream fout = new FileOutputStream(file);
                    try {
                        int numBytesRead;
                        while ((numBytesRead = zipStream.read(buffer)) != -1) {
                            fout.write(buffer, 0, numBytesRead);
                        }
                    } finally {
                        fout.close();
                    }
                }
                long time = entry.getTime();
                if (time > 0) {
                    file.setLastModified(time);
                }
            }
        } finally {
            try {
                if (zipStream != null) zipStream.close();
                if (bufferedStream != null) bufferedStream.close();
                if (fileStream != null) fileStream.close();
            } catch (IOException e) {
                throw new IOException("Error closing IO resources.", e);
            }
        }
    }

    public static void writeStringToFile(String content, String filePath) throws IOException {
        PrintWriter out = null;
        try {
            out = new PrintWriter(filePath);
            out.print(content);
        } finally {
            if (out != null) out.close();
        }
    }

    /**
     *
     * @param context
     * @param assetFilePath
     * @param destPath
     */
    public static boolean copyAssetFile(Context context,String assetFilePath, String destPath,boolean overWrite){
        AssetManager assetManager = context.getAssets();
        File fileDir = context.getFilesDir();
        String absoluteDestPath = fileDir.getAbsolutePath()+File.separator+destPath;
        try {
            ArrayList<String>  files = getAssetsFilePath(context,assetFilePath,null);
            for(int i=0;i<files.size();i++){
                Log.i(TAG,files.get(i));
                String path = files.get(i);
                File desFile = new File(absoluteDestPath + File.separator + path);
                if (desFile == null) return false;
                if(!overWrite){
                    if(desFile.exists()){
                        continue;
                    }
                }
                try {
                    InputStream is = assetManager.open(path);
                    boolean result = writeFileFromIS(desFile, is);
                    if (!result) return false;
                } catch (FileNotFoundException e) {
                    return false;
                }
            }

        }catch (IOException e){
            e.printStackTrace();
            return false;
        }
        return true;
    }



    private static ArrayList<String> getAssetsFilePath(Context context, String oriPath, ArrayList<String> paths) throws IOException{

        if (paths == null) paths = new ArrayList<>();

            String[] list = context.getAssets().list(oriPath);
            for (String l : list) {
                int length = context.getAssets().list(l).length;
                String desPath = oriPath.equals("") ? l : oriPath + "/" + l;
                if (length == 0) {
                    paths.add(desPath);
                } else {
                    getAssetsFilePath(context, desPath, paths);
                }
            }
            return paths;

    }


    private static boolean writeFileFromIS(File file, InputStream is) {
        if (file == null || is == null) return false;
        if (!createOrExistsFile(file)) return false;

        OutputStream os = null;
        try {
            os = new BufferedOutputStream(new FileOutputStream(file));
            byte data[] = new byte[1024];
            int len;
            while ((len = is.read(data, 0, 1024)) != -1) {
                os.write(data, 0, len);
            }
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        } finally {
            closeIO(is, os);
        }
    }



    private static boolean createOrExistsFile(File file) {
        if (file == null) return false;
        if (file.exists()) return file.isFile();
        if (!createOrExistsDir(file.getParentFile())) return false;
        try {
            return file.createNewFile();
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }


    private static boolean createOrExistsDir(File file) {
        return file != null && (file.exists() ? file.isDirectory() : file.mkdirs());
    }


    private static void closeIO(Closeable... closeables) {
        if (closeables == null) return;
        for (Closeable closeable : closeables) {
            if (closeable != null) {
                try {
                    closeable.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
