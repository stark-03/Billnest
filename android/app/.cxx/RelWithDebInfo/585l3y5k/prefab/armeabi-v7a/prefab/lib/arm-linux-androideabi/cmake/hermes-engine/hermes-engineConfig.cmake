if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/home/sourab/.gradle/caches/8.13/transforms/532fdff9465dd631d517bd26502bc504/transformed/hermes-android-0.79.2-release/prefab/modules/libhermes/libs/android.armeabi-v7a/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/sourab/.gradle/caches/8.13/transforms/532fdff9465dd631d517bd26502bc504/transformed/hermes-android-0.79.2-release/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

